import { User } from "../../models/user.model.js";
import { Company } from "../../models/company.model.js";
import { Job } from "../../models/job.model.js";
import { Application } from "../../models/application.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { Resume } from "../../models/resume.model.js";
import { InterviewSchedule } from "../../models/interviewSchedule.model.js";
import { InterviewFeedback } from "../../models/interviewFeedback.model.js";

import { batchInsert } from "../helpers.js";
import { purgeHiringData } from "../purgeHiringData.js";
import {
    assignRecruiterBehavior,
    summarizeRecruiterTiers,
    scaleAssignmentsToMinimum,
} from "./recruiters/behavior.js";
import { generateJobs, enrichCompaniesForHiring } from "./jobs/generator.js";
import { buildCandidateIntelligence } from "./candidates/intelligence.js";
import { generateApplications } from "./applications/engine.js";
import { generateInterviews, buildInterviewFeedback } from "./interviews/generator.js";
import { validateHiringSeed } from "./validators/index.js";
import { HIRING_TARGETS } from "./config.js";

const stripInternal = (docs) =>
    docs.map((d) => {
        const { _meetLink, _seedMeta, ...rest } = d;
        return rest;
    });

/**
 * Rebuild hiring ecosystem on top of existing foundation data.
 */
export const runHiringSimulation = async () => {
    const start = Date.now();
    console.log("\n=== HIRING SIMULATION (--with-hiring) ===\n");

    await purgeHiringData();

    const [recruiters, companies, candidates, profiles, resumes] = await Promise.all([
        User.find({ role: "recruiter" }).lean(),
        Company.find({}).lean(),
        User.find({ role: "candidate" }).lean(),
        CandidateProfile.find({}).lean(),
        Resume.find({}).lean(),
    ]);

    if (!recruiters.length || !companies.length || !candidates.length) {
        throw new Error(
            "Foundation data missing. Run `npm run seed:fresh` first, then `npm run seed -- --with-hiring`."
        );
    }

    console.log("=== Phase 1: Recruiter hiring activation ===");
    const assignments = scaleAssignmentsToMinimum(assignRecruiterBehavior(recruiters));
    const { summary, totalJobs } = summarizeRecruiterTiers(assignments);
    console.log("  Recruiter tiers:", summary);
    console.log(`  Planned jobs: ~${totalJobs} (target ${HIRING_TARGETS.jobsMin}-${HIRING_TARGETS.jobsMax})`);

    console.log("\n=== Phase 2: Company intelligence enrichment ===");
    const companyOps = enrichCompaniesForHiring(companies);
    if (companyOps.length) await Company.bulkWrite(companyOps);
    console.log(`  Companies enriched: ${companyOps.length}`);
    const enrichedCompanies = await Company.find({}).lean();

    console.log("\n=== Phase 3: Job generation ===");
    const jobDocs = stripInternal(generateJobs(recruiters, enrichedCompanies, assignments));
    const jobs = await batchInsert(Job, jobDocs, "Jobs");
    console.log(`  Jobs created: ${jobs.length}`);

    if (jobs.length < HIRING_TARGETS.jobsMin) {
        console.warn(`  ⚠ Job count ${jobs.length} below minimum ${HIRING_TARGETS.jobsMin}`);
    }

    console.log("\n=== Phase 4: Candidate intelligence ===");
    const candidateIntel = buildCandidateIntelligence(candidates, profiles, resumes);
    const totalTargetApps = candidateIntel.reduce((s, c) => s + c.targetApplications, 0);
    console.log(`  Candidates: ${candidateIntel.length}, target applications: ~${totalTargetApps}`);

    await CandidateProfile.bulkWrite(
        candidateIntel.map((c) => ({
            updateOne: {
                filter: { userId: c.candidateId },
                update: {
                    $set: {
                        preferences: {
                            activityLevel: c.activityLevel,
                            preferredRoles: c.preferredRoles,
                            skillCluster: c.skillCluster,
                            preferredLocations: c.preferredLocations,
                            expectedSalary: c.expectedSalary,
                            seniority: c.seniority,
                        },
                    },
                },
            },
        }))
    );
    console.log("  Candidate preferences enriched for hiring behavior");

    console.log("\n=== Phase 5: Application engine ===");
    const applicationDocs = stripInternal(generateApplications(candidateIntel, jobs));
    const applications = await batchInsert(Application, applicationDocs, "Applications");
    console.log(`  Applications created: ${applications.length}`);

    console.log("\n=== Phase 8: Interviews ===");
    const { interviews: interviewDocs } = generateInterviews(
        applicationDocs,
        recruiters,
        applications
    );
    const interviews = await batchInsert(InterviewSchedule, interviewDocs, "Interviews");

    const feedbackDocs = buildInterviewFeedback(interviews);
    if (feedbackDocs.length) {
        await batchInsert(InterviewFeedback, feedbackDocs, "InterviewFeedback");
    }

    console.log("\n=== Phase 14: Validation ===");
    validateHiringSeed({
        recruiters,
        companies,
        jobs,
        applications,
        interviews,
        candidateIds: candidates.map((c) => c._id),
        resumeIds: resumes.map((r) => r._id),
    });
    console.log("  ✓ All hiring integrity checks passed");

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const statusCounts = {};
    for (const app of applications) {
        const s = app.applicationStatus || app.status;
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    console.log("\n=======================================");
    console.log("✅ HIRING SIMULATION COMPLETE");
    console.log("=======================================");
    console.log(`Jobs:              ${jobs.length}`);
    console.log(`Applications:      ${applications.length}`);
    console.log(`Interviews:        ${interviews.length}`);
    console.log(`Application mix:   ${JSON.stringify(statusCounts)}`);
    console.log(`Duration:          ${elapsed}s`);
    console.log("=======================================\n");

    return { jobs, applications, interviews };
};
