/**
 * Document-only database cleanup for reseeding.
 * Does NOT drop collections, indexes, or schemas.
 *
 * Usage: npm run clear-db
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
import { AIChat } from "../models/aiChat.model.js";
import { AIInterviewLog } from "../models/aiInterviewLog.model.js";
import { AdminLog } from "../models/adminLog.model.js";
import { ChatRoom } from "../models/chatRoom.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { Resume } from "../models/resume.model.js";
import { InterviewSchedule } from "../models/interviewSchedule.model.js";
import { OtpTemp } from "../models/OtpTemp.js";
import { ROLES } from "../constants/roles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const ADMIN_ROLES = [ROLES.ADMIN, "admin", "ADMIN"];

const candidateRoles = [
    ROLES.CANDIDATE,
    "Candidate",
    "candidate",
    "CANDIDATE",
    "student",
    "jobseeker",
];

const recruiterRoles = [ROLES.RECRUITER, "recruiter", "RECRUITER"];

const clearCollection = async (label, deleteFn) => {
    const result = await deleteFn();
    const count = result?.deletedCount ?? 0;
    console.log(`✓ ${label} Cleared (${count} documents)`);
    return count;
};

const clearDatabase = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in backend/.env");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.\n");
        console.log("Clearing seeded documents (collections & indexes preserved)...\n");

        // Child / dependent data first
        await clearCollection("Chat Messages", () => ChatMessage.deleteMany({}));
        await clearCollection("Chats", () => ChatRoom.deleteMany({}));
        await clearCollection("AI Interview Logs", () => AIInterviewLog.deleteMany({}));
        await clearCollection("AI Chats", () => AIChat.deleteMany({}));
        await clearCollection("Admin Logs", () => AdminLog.deleteMany({}));
        await clearCollection("Interview Schedules", () => InterviewSchedule.deleteMany({}));
        await clearCollection("Applications", () => Application.deleteMany({}));
        await clearCollection("Jobs", () => Job.deleteMany({}));
        await clearCollection("Resume Analysis", () => ResumeAnalysis.deleteMany({}));
        await clearCollection("Resumes", () => Resume.deleteMany({}));
        await clearCollection("Candidate Profiles", () => CandidateProfile.deleteMany({}));
        await clearCollection("Companies", () => Company.deleteMany({}));
        await clearCollection("OTP Temp", () => OtpTemp.deleteMany({}));

        await clearCollection("Candidates", () =>
            User.deleteMany({ role: { $in: candidateRoles } })
        );
        await clearCollection("Recruiters", () =>
            User.deleteMany({ role: { $in: recruiterRoles } })
        );

        // Remove any remaining non-admin users (legacy roles, typos, etc.)
        const otherUsers = await User.deleteMany({ role: { $nin: ADMIN_ROLES } });
        if (otherUsers.deletedCount > 0) {
            console.log(`✓ Other Users Cleared (${otherUsers.deletedCount} documents)`);
        }

        const adminCount = await User.countDocuments({ role: { $in: ADMIN_ROLES } });
        console.log(`\nPreserved admin accounts: ${adminCount}`);

        // Models not present in this codebase
        console.log("\n— Skills: skipped (no Skill model/collection)");
        console.log("— Notifications: skipped (no Notification model/collection)");

        console.log("\n=======================================");
        console.log("Database cleanup complete.");
        console.log("Collections, schemas, and indexes are intact.");
        console.log("Ready for expanded reseeding.");
        console.log("=======================================\n");
    } catch (error) {
        console.error("Database cleanup failed:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
};

clearDatabase();
