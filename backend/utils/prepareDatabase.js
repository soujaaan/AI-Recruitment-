/**
 * Database preparation: clean demo data, remove deprecated collections,
 * dedupe admins, normalize documents, sync indexes.
 *
 * Does NOT drop the database or core collection structures.
 *
 * Usage: npm run prepare-db
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Company } from "../models/company.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { Resume } from "../models/resume.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { ChatRoom } from "../models/chatRoom.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { InterviewSchedule } from "../models/interviewSchedule.model.js";
import { InterviewFeedback } from "../models/interviewFeedback.model.js";
import { AIChat } from "../models/aiChat.model.js";
import { AIInterviewLog } from "../models/aiInterviewLog.model.js";
import { AdminLog } from "../models/adminLog.model.js";
import { AILog } from "../models/aiLog.model.js";
import { Notification } from "../models/notification.model.js";
import { SavedJob } from "../models/savedJob.model.js";
import { Recommendation } from "../models/recommendation.model.js";
import { Assessment } from "../models/assessment.model.js";
import { CandidateAssessment } from "../models/candidateAssessment.model.js";
import { AssessmentAttempt } from "../models/assessmentAttempt.model.js";
import { QuestionBank } from "../models/questionBank.model.js";
import { Question } from "../models/question.model.js";
import { OtpTemp } from "../models/OtpTemp.js";
import { ROLES } from "../constants/roles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const ADMIN_ROLES = [ROLES.ADMIN, "admin", "ADMIN"];
const CANDIDATE_ROLES = [ROLES.CANDIDATE, "Candidate", "candidate", "CANDIDATE", "student", "jobseeker"];
const RECRUITER_ROLES = [ROLES.RECRUITER, "recruiter", "RECRUITER"];

/** Collections to purge with deleteMany (preserve collection + indexes) */
const PURGE_MODELS = [
    { label: "Questions", model: Question },
    { label: "Question Banks", model: QuestionBank },
    { label: "Assessment Attempts", model: AssessmentAttempt },
    { label: "Candidate Assessments", model: CandidateAssessment },
    { label: "Assessments", model: Assessment },
    { label: "Interview Feedback", model: InterviewFeedback },
    { label: "Interview Schedules", model: InterviewSchedule },
    { label: "Chat Messages", model: ChatMessage },
    { label: "Chat Rooms", model: ChatRoom },
    { label: "Recommendations", model: Recommendation },
    { label: "Saved Jobs", model: SavedJob },
    { label: "Notifications", model: Notification },
    { label: "AI Logs", model: AILog },
    { label: "AI Interview Logs", model: AIInterviewLog },
    { label: "AI Chats", model: AIChat },
    { label: "Admin Logs", model: AdminLog },
    { label: "Applications", model: Application },
    { label: "Jobs", model: Job },
    { label: "Resume Analyses", model: ResumeAnalysis },
    { label: "Resumes", model: Resume },
    { label: "Candidate Profiles", model: CandidateProfile },
    { label: "Companies", model: Company },
];

/** Legacy collection name patterns to DROP entirely */
const DROP_COLLECTION_PATTERNS = [
    /^users_backup_/i,
    /^user_backup_/i,
    /^otpverifications$/i,
    /^test_/i,
    /^temp_/i,
];

const log = (msg) => console.log(msg);

const purgeCollection = async (label, deleteFn) => {
    const result = await deleteFn();
    log(`✓ ${label} Cleared (${result.deletedCount ?? 0} documents)`);
};

const dropDeprecatedCollections = async (db) => {
    const collections = await db.listCollections().toArray();
    let dropped = 0;

    for (const col of collections) {
        const name = col.name;
        if (DROP_COLLECTION_PATTERNS.some((re) => re.test(name))) {
            await db.dropCollection(name);
            log(`✓ Dropped deprecated collection: ${name}`);
            dropped++;
        }
    }

    if (dropped === 0) log("— No deprecated backup/temp collections found");
};

const deduplicateAdmins = async () => {
    const admins = await User.find({ role: { $in: ADMIN_ROLES } }).sort({ createdAt: 1 });
    const preferredEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const byEmail = new Map();
    let removed = 0;

    for (const admin of admins) {
        const email = admin.email?.toLowerCase();
        if (!email) continue;
        if (!byEmail.has(email)) byEmail.set(email, []);
        byEmail.get(email).push(admin);
    }

    const keptIds = new Set();

    for (const [, list] of byEmail) {
        let keep = list[0];
        if (preferredEmail) {
            const preferred = list.find((a) => a.email?.toLowerCase() === preferredEmail);
            if (preferred) keep = preferred;
        }
        keptIds.add(String(keep._id));

        for (const admin of list) {
            if (String(admin._id) !== String(keep._id)) {
                await User.deleteOne({ _id: admin._id });
                removed++;
            }
        }
    }

    for (const id of keptIds) {
        await User.updateOne(
            { _id: id },
            {
                $set: {
                    role: ROLES.ADMIN,
                    isActive: true,
                    isBlocked: false,
                    isEmailVerified: true,
                },
                $unset: { otp: "", otpExpiry: "" },
            }
        );
    }

    log(`✓ Admin accounts normalized (${keptIds.size} kept, ${removed} duplicates removed)`);
};

const normalizeUserRoles = async () => {
    const roleMap = [
        { from: { $in: CANDIDATE_ROLES }, to: ROLES.CANDIDATE },
        { from: { $in: RECRUITER_ROLES }, to: ROLES.RECRUITER },
        { from: { $in: ADMIN_ROLES }, to: ROLES.ADMIN },
    ];

    for (const { from, to } of roleMap) {
        const res = await User.updateMany({ role: from }, { $set: { role: to } });
        if (res.modifiedCount > 0) log(`  → Normalized ${res.modifiedCount} users to role "${to}"`);
    }
};

const migrateExistingDocuments = async () => {
    const jobs = await Job.find({}).lean();
    let jobsUpdated = 0;
    for (const job of jobs) {
        const updates = {};
        if (job.created_by && !job.recruiterId) updates.recruiterId = job.created_by;
        if (job.requirements?.length && !job.requiredSkills?.length) updates.requiredSkills = job.requirements;
        if (job.jobType && !job.employmentType) updates.employmentType = job.jobType;
        if (Object.keys(updates).length) {
            await Job.updateOne({ _id: job._id }, { $set: updates });
            jobsUpdated++;
        }
    }
    if (jobsUpdated) log(`  → Migrated ${jobsUpdated} job documents`);

    const apps = await Application.find({}).lean();
    let appsUpdated = 0;
    for (const app of apps) {
        const updates = {};
        if (app.job && !app.jobId) updates.jobId = app.job;
        if (app.applicant && !app.candidateId) updates.candidateId = app.applicant;
        if (app.status && !app.applicationStatus) updates.applicationStatus = app.status;
        if (Object.keys(updates).length) {
            await Application.updateOne({ _id: app._id }, { $set: updates });
            appsUpdated++;
        }
    }
    if (appsUpdated) log(`  → Migrated ${appsUpdated} application documents`);

    const profiles = await CandidateProfile.find({}).lean();
    let profilesUpdated = 0;
    for (const p of profiles) {
        if (p.userId && !p.candidateId) {
            await CandidateProfile.updateOne({ _id: p._id }, { $set: { candidateId: p.userId } });
            profilesUpdated++;
        }
    }
    if (profilesUpdated) log(`  → Migrated ${profilesUpdated} candidate profile documents`);

    const companies = await Company.find({}).lean();
    let companiesUpdated = 0;
    for (const c of companies) {
        if (c.userId && !c.recruiterId) {
            await Company.updateOne({ _id: c._id }, { $set: { recruiterId: c.userId } });
            companiesUpdated++;
        }
    }
    if (companiesUpdated) log(`  → Migrated ${companiesUpdated} company documents`);
};

const syncAllIndexes = async () => {
    const models = [
        User,
        Company,
        Job,
        Application,
        CandidateProfile,
        Resume,
        ResumeAnalysis,
        ChatRoom,
        ChatMessage,
        InterviewSchedule,
        InterviewFeedback,
        Notification,
        AILog,
        SavedJob,
        Recommendation,
        Assessment,
        CandidateAssessment,
        AssessmentAttempt,
        QuestionBank,
        Question,
        OtpTemp,
    ];

    for (const model of models) {
        try {
            await model.syncIndexes();
            log(`  → Indexes synced: ${model.collection.collectionName}`);
        } catch (err) {
            log(`  ⚠ Index sync warning (${model.modelName}): ${err.message}`);
        }
    }
};

const printFinalInventory = async (db) => {
    const target = [
        "users",
        "companies",
        "jobs",
        "applications",
        "candidateprofiles",
        "resumes",
        "resumeanalyses",
        "chatrooms",
        "chatmessages",
        "interviewschedules",
        "assessments",
        "candidateassessments",
        "assessmentattempts",
        "questionbanks",
        "questions",
        "notifications",
        "ailogs",
        "savedjobs",
        "recommendations",
        "interviewfeedbacks",
        "otptemps",
    ];

    log("\n--- Final Collection Inventory ---");
    const cols = await db.listCollections().toArray();
    const names = cols.map((c) => c.name).sort();

    for (const name of target) {
        const exists = names.includes(name);
        const count = exists ? await db.collection(name).countDocuments() : 0;
        log(`${exists ? "✓" : "○"} ${name} (${count} docs)`);
    }

    const extra = names.filter((n) => !target.includes(n) && !n.startsWith("system."));
    if (extra.length) log(`\nOther collections: ${extra.join(", ")}`);
};

const prepareDatabase = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in backend/.env");
        process.exit(1);
    }

    try {
        log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        log("Connected.\n");

        log("=== STEP 1: Drop deprecated / backup collections ===\n");
        await dropDeprecatedCollections(db);

        log("\n=== STEP 2: Purge seeded & demo documents ===\n");
        for (const { label, model } of PURGE_MODELS) {
            await purgeCollection(label, () => model.deleteMany({}));
        }

        await purgeCollection("OTP Temp (data only, structure kept)", () => OtpTemp.deleteMany({}));
        await purgeCollection("Candidates", () => User.deleteMany({ role: { $in: CANDIDATE_ROLES } }));
        await purgeCollection("Recruiters", () => User.deleteMany({ role: { $in: RECRUITER_ROLES } }));
        const other = await User.deleteMany({ role: { $nin: [...ADMIN_ROLES, ROLES.CANDIDATE, ROLES.RECRUITER] } });
        if (other.deletedCount) log(`✓ Other Users Cleared (${other.deletedCount} documents)`);

        log("\n=== STEP 3: Admin deduplication & normalization ===\n");
        await deduplicateAdmins();
        await normalizeUserRoles();

        log("\n=== STEP 4: Document field migration (legacy → canonical) ===\n");
        await migrateExistingDocuments();

        log("\n=== STEP 5: Sync indexes ===\n");
        await syncAllIndexes();

        log("\n=== STEP 6: Final inventory ===");
        await printFinalInventory(db);

        const adminCount = await User.countDocuments({ role: ROLES.ADMIN });
        log(`\n=======================================`);
        log(`Database preparation complete.`);
        log(`Admin accounts preserved: ${adminCount}`);
        log(`Ready for foundation seed (npm run seed or npm run seed:fresh).`);
        log(`=======================================\n`);
    } catch (error) {
        console.error("Database preparation failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        log("MongoDB connection closed.");
    }
};

prepareDatabase();
