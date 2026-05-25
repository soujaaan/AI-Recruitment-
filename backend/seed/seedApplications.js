import { faker } from "@faker-js/faker";
import { calculateSkillMatch } from "../utils/skillMatch.util.js";
import { APPLICATION_STATUS_WEIGHTS } from "./config.js";
import { weightedPick, aiRankingFromScore, randInt, pick } from "./helpers.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";

const buildInterviewStages = (status) => {
    const stages = [{ stage: "Applied", status: "completed", scheduledAt: faker.date.past({ years: 0.1 }) }];
    if (["under review", "shortlisted", "interview scheduled", "hired"].includes(status)) {
        stages.push({ stage: "Resume Screening", status: "completed", notes: "AI + recruiter review" });
    }
    if (["shortlisted", "interview scheduled", "hired"].includes(status)) {
        stages.push({ stage: "Shortlist", status: "completed", notes: "Moved to shortlist" });
    }
    if (["interview scheduled", "hired"].includes(status)) {
        stages.push({
            stage: "Technical Interview",
            status: status === "interview scheduled" ? "scheduled" : "completed",
            scheduledAt: faker.date.soon({ days: 14 }),
            notes: "Video round",
        });
    }
    if (status === "hired") {
        stages.push({ stage: "Offer", status: "completed", notes: "Offer accepted" });
    }
    if (status === "rejected") {
        stages.push({ stage: "Rejected", status: "completed", notes: pick(["Skill gap", "Role filled", "Culture fit"]) });
    }
    return stages;
};

export const buildApplications = async (targetCount, candidatesIn, jobsIn, candidateProfilesIn, resumesIn) => {
    const candidates = candidatesIn && candidatesIn.length ? candidatesIn : await User.find({ role: "candidate" });
    const jobs = jobsIn && jobsIn.length ? jobsIn : await Job.find({});
    const candidateProfiles = candidateProfilesIn && candidateProfilesIn.length ? candidateProfilesIn : await CandidateProfile.find({});
    const resumes = resumesIn && resumesIn.length ? resumesIn : await Resume.find({});

    const applications = [];
    const usedPairs = new Set();
    const profileByUser = new Map(candidateProfiles.map((p) => [String(p.userId || p.candidateId), p]));
    const resumeByUser = new Map(resumes.map((r) => [String(r.userId || r.user), r]));

    const maxAttempts = targetCount * 3;
    let attempts = 0;

    while (applications.length < targetCount && attempts < maxAttempts) {
        attempts++;
        const candidate = pick(candidates);
        const job = pick(jobs);
        
        if (!candidate || !job) continue;

        const profile = profileByUser.get(String(candidate._id));
        const resume = resumeByUser.get(String(candidate._id));

        // Mandatory Integrity Validation Check
        if (!candidate || !profile || !resume || !job || !job.recruiterId) {
            continue; // skipApplication();
        }

        const key = `${candidate._id}:${job._id}`;
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);

        const candidateSkills = profile?.skills || [];
        const requiredSkills = job.requiredSkills?.length ? job.requiredSkills : job.requirements || [];
        const { matchScore, matchedSkills, missingSkills } = calculateSkillMatch(candidateSkills, requiredSkills);
        const atsMin = Math.min(94, Math.max(35, matchScore - 15));
        const atsMax = Math.max(atsMin + 1, Math.min(98, matchScore + 12));
        const atsScore = randInt(atsMin, atsMax);
        const status = weightedPick(APPLICATION_STATUS_WEIGHTS);

        applications.push({
            jobId: job._id,
            candidateId: candidate._id,
            recruiterId: job.recruiterId,
            companyId: job.companyId,
            
            // Clean target relational fields
            candidate: candidate._id,
            candidateProfile: profile._id,
            resume: resume._id,
            job: job._id,
            recruiter: job.recruiterId,
            aiMatchScore: matchScore,
            appliedAt: faker.date.past({ years: 0.4 }),

            applicationStatus: status,
            applicant: candidate._id,
            status,
            atsScore,
            matchScore,
            matchedSkills,
            missingSkills,
            aiRanking: aiRankingFromScore(matchScore),
            aiEvaluationSummary: `AI confidence ${randInt(62, 98)}%. Ranking based on ${matchedSkills.length} matched skills.`,
            interviewStages: buildInterviewStages(status),
            createdAt: faker.date.past({ years: 0.4 }),
            updatedAt: faker.date.recent({ days: 30 }),
        });
    }

    return applications;
};

export const computeJobApplicantCounts = (applications) => {
    const counts = new Map();
    for (const app of applications) {
        const jid = String(app.jobId || app.job);
        counts.set(jid, (counts.get(jid) || 0) + 1);
    }
    return counts;
};
