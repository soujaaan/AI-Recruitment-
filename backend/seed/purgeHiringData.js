import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { ChatRoom } from "../models/chatRoom.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { InterviewSchedule } from "../models/interviewSchedule.model.js";
import { InterviewFeedback } from "../models/interviewFeedback.model.js";
import { Notification } from "../models/notification.model.js";
import { AILog } from "../models/aiLog.model.js";
import { AIInterviewLog } from "../models/aiInterviewLog.model.js";
import { SavedJob } from "../models/savedJob.model.js";
import { Recommendation } from "../models/recommendation.model.js";
import { Assessment } from "../models/assessment.model.js";
import { CandidateAssessment } from "../models/candidateAssessment.model.js";
import { AssessmentAttempt } from "../models/assessmentAttempt.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { Resume } from "../models/resume.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";

/** Hiring / workflow collections — candidates, recruiters, companies, resumes stay intact */
export const HIRING_PURGE_MODELS = [
    ["Assessment Attempts", AssessmentAttempt],
    ["Candidate Assessments", CandidateAssessment],
    ["Assessments", Assessment],
    ["Interview Feedback", InterviewFeedback],
    ["Interview Schedules", InterviewSchedule],
    ["Chat Messages", ChatMessage],
    ["Chat Rooms", ChatRoom],
    ["Recommendations", Recommendation],
    ["Saved Jobs", SavedJob],
    ["Notifications", Notification],
    ["AI Interview Logs", AIInterviewLog],
    ["AI Logs", AILog],
    ["Applications", Application],
    ["Jobs", Job],
];

/**
 * Remove all job-posting and hiring workflow data.
 * Preserves: users (candidates/recruiters/admins), companies, candidate profiles, resumes, analyses.
 */
export const purgeHiringData = async () => {
    console.log("Purging hiring & workflow data (preserving accounts & profiles)...\n");

    for (const [label, model] of HIRING_PURGE_MODELS) {
        const r = await model.deleteMany({});
        console.log(`  ✓ ${label}: ${r.deletedCount}`);
    }
};

/**
 * Strip job/application references from documents that remain after purge.
 */
export const clearHiringReferences = async () => {
    console.log("\nClearing hiring references on retained documents...");

    const profileResult = await CandidateProfile.updateMany(
        {},
        {
            $set: {
                appliedJobs: [],
                savedJobs: [],
                interviewHistory: [],
            },
        }
    );
    console.log(`  ✓ Candidate profiles cleared: ${profileResult.modifiedCount} updated`);

    const usersWithApplied = await User.updateMany(
        { "profile.appliedJobs": { $exists: true } },
        { $unset: { "profile.appliedJobs": "" } }
    );
    if (usersWithApplied.modifiedCount) {
        console.log(`  ✓ User profile appliedJobs unset: ${usersWithApplied.modifiedCount}`);
    }

    const companies = await Company.find({}).lean();
    let companiesUpdated = 0;
    for (const company of companies) {
        let description = company.description || "";
        description = description
            .replace(/Hiring status:\s*[^.]+\./gi, "Hiring status: not started.")
            .replace(/activeJobsCount:\s*\d+/gi, "activeJobsCount: 0");
        if (description !== company.description) {
            await Company.updateOne({ _id: company._id }, { $set: { description, isActive: true } });
            companiesUpdated++;
        }
    }
    console.log(`  ✓ Company descriptions normalized: ${companiesUpdated}`);
};

/** Remove profiles/resumes/analyses whose user no longer exists; stray applications after purge */
export const cleanupOrphanedData = async () => {
    console.log("\nCleaning up orphaned records...");

    const users = await User.find({}).select("_id role").lean();
    const candidateIds = new Set(users.filter((u) => u.role === "candidate").map((u) => String(u._id)));

    const profiles = await CandidateProfile.find({}).lean();
    let deletedProfilesCount = 0;
    for (const profile of profiles) {
        const userIdStr = String(profile.userId || profile.candidateId);
        if (!candidateIds.has(userIdStr)) {
            await CandidateProfile.deleteOne({ _id: profile._id });
            deletedProfilesCount++;
        }
    }
    console.log(`  ✓ Orphaned candidate profiles removed: ${deletedProfilesCount}`);

    const candidateObjectIds = users.filter((u) => u.role === "candidate").map((u) => u._id);

    const orphanResumes = await Resume.deleteMany({
        userId: { $nin: candidateObjectIds },
    });
    if (orphanResumes.deletedCount) {
        console.log(`  ✓ Orphaned resumes removed: ${orphanResumes.deletedCount}`);
    }

    const orphanAnalyses = await ResumeAnalysis.deleteMany({
        $or: [
            { userId: { $nin: candidateObjectIds } },
            { candidateId: { $nin: candidateObjectIds } },
        ],
    });
    if (orphanAnalyses.deletedCount) {
        console.log(`  ✓ Orphaned resume analyses removed: ${orphanAnalyses.deletedCount}`);
    }

    const orphanApps = await Application.deleteMany({});
    if (orphanApps.deletedCount) {
        console.log(`  ✓ Stray applications removed: ${orphanApps.deletedCount}`);
    }

    const orphanJobs = await Job.deleteMany({});
    if (orphanJobs.deletedCount) {
        console.log(`  ✓ Stray jobs removed: ${orphanJobs.deletedCount}`);
    }
};

/**
 * Keep only companies linked to a recruiter account (drops unassigned dummy companies).
 */
export const pruneOrphanCompanies = async () => {
    console.log("\nPruning unlinked company records...");

    const recruiters = await User.find({ role: "recruiter" }).select("_id companyId company").lean();
    const recruiterIds = new Set(recruiters.map((r) => String(r._id)));

    const allCompanies = await Company.find({}).select("_id recruiterId userId").lean();
    const keepByRecruiter = new Map();

    for (const company of allCompanies) {
        const ownerId = String(company.recruiterId || company.userId || "");
        if (!recruiterIds.has(ownerId)) continue;
        if (!keepByRecruiter.has(ownerId)) {
            keepByRecruiter.set(ownerId, company._id);
        }
    }

    const keepIds = new Set([...keepByRecruiter.values()].map(String));
    let removed = 0;

    for (const company of allCompanies) {
        if (!keepIds.has(String(company._id))) {
            await Company.deleteOne({ _id: company._id });
            removed++;
        }
    }

    const linkOps = [];
    for (const rec of recruiters) {
        const companyId = keepByRecruiter.get(String(rec._id));
        if (companyId) {
            linkOps.push({
                updateOne: {
                    filter: { _id: rec._id },
                    update: { $set: { company: companyId, companyId } },
                },
            });
        }
    }
    if (linkOps.length) await User.bulkWrite(linkOps);

    console.log(`  ✓ Duplicate/unlinked companies removed: ${removed}`);
    console.log(`  ✓ Companies remaining: ${await Company.countDocuments()}`);
    console.log(`  ✓ Recruiters linked to company: ${linkOps.length}`);
};

export const resetToPreJobPosting = async () => {
    await purgeHiringData();
    await clearHiringReferences();
    await pruneOrphanCompanies();
    await cleanupOrphanedData();
};
