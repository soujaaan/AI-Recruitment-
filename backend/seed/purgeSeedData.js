import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { Resume } from "../models/resume.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { QuestionBank } from "../models/questionBank.model.js";
import { Question } from "../models/question.model.js";
import { OtpTemp } from "../models/OtpTemp.js";
import { ADMIN_ROLES } from "./helpers.js";
import { ROLES } from "../constants/roles.js";
import { purgeHiringData, clearHiringReferences, cleanupOrphanedData } from "./purgeHiringData.js";

const CANDIDATE_ROLES = [ROLES.CANDIDATE, "Candidate", "candidate"];
const RECRUITER_ROLES = [ROLES.RECRUITER, "recruiter", "RECRUITER"];

/**
 * Purge seeded data only — preserves admin users and collection structures.
 */
export const purgeSeedData = async () => {
    console.log("Purging non-admin seed data (deleteMany only)...\n");

    const accountModels = [
        ["Questions", Question],
        ["Question Banks", QuestionBank],
        ["Resume Analyses", ResumeAnalysis],
        ["Resumes", Resume],
        ["Candidate Profiles", CandidateProfile],
        ["Companies", Company],
    ];

    await purgeHiringData();

    for (const [label, model] of accountModels) {
        const r = await model.deleteMany({});
        console.log(`  ✓ ${label}: ${r.deletedCount}`);
    }

    await OtpTemp.deleteMany({});
    
    // Log distinct roles in DB before deletion
    const rolesBefore = await User.distinct("role");
    console.log(`  → Distinct roles before purge: ${JSON.stringify(rolesBefore)}`);

    // Candidate deletion with logging
    const candidateResult = await User.deleteMany({ role: { $in: CANDIDATE_ROLES } });
    console.log(`  ✓ Candidates purged: matched/deletedCount = ${candidateResult.deletedCount}`);

    // Recruiter deletion with logging
    const recruiterResult = await User.deleteMany({ role: { $in: RECRUITER_ROLES } });
    console.log(`  ✓ Recruiters purged: matched/deletedCount = ${recruiterResult.deletedCount}`);

    // Force cleanup: delete any users with seed.hireai.dev in their email
    const forceResult = await User.deleteMany({ email: /seed\.hireai\.dev/i });
    if (forceResult.deletedCount > 0) {
        console.log(`  ✓ Force cleanup purged: ${forceResult.deletedCount} legacy '@seed.hireai.dev' users`);
    } else {
        console.log(`  ✓ Force cleanup: No remaining legacy '@seed.hireai.dev' users found`);
    }

    const adminCount = await User.countDocuments({ role: { $in: ADMIN_ROLES } });
    console.log(`\n  ✓ Admins preserved: ${adminCount}\n`);

    await clearHiringReferences();
    await cleanupOrphanedData();
};

export { purgeHiringData, clearHiringReferences, cleanupOrphanedData };
