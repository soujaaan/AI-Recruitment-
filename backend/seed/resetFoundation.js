/**
 * Reset platform to pre-job-posting state.
 * Keeps: candidate accounts + rich profiles, recruiter accounts + company profiles.
 * Removes: jobs, applications, interviews, chats, notifications, AI ranking, saved jobs, etc.
 *
 * Usage: npm run reset-foundation
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { Resume } from "../models/resume.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { ROLES } from "../constants/roles.js";
import { resetToPreJobPosting } from "./purgeHiringData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const printInventory = async () => {
    const counts = {
        candidates: await User.countDocuments({ role: ROLES.CANDIDATE }),
        recruiters: await User.countDocuments({ role: ROLES.RECRUITER }),
        admins: await User.countDocuments({ role: ROLES.ADMIN }),
        companies: await Company.countDocuments(),
        candidateProfiles: await CandidateProfile.countDocuments(),
        resumes: await Resume.countDocuments(),
        resumeAnalyses: await ResumeAnalysis.countDocuments(),
        jobs: await Job.countDocuments(),
        applications: await Application.countDocuments(),
    };

    console.log("\n=======================================");
    console.log("PRE-JOB-POSTING INVENTORY");
    console.log("=======================================");
    for (const [key, value] of Object.entries(counts)) {
        console.log(`  ${key.padEnd(18)} ${value}`);
    }
    console.log("=======================================\n");
};

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in backend/.env");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.\n");

        await resetToPreJobPosting();
        await printInventory();

        console.log("Foundation reset complete.");
        console.log("Jobs & hiring pipelines are empty; candidate/recruiter accounts preserved.\n");
        process.exit(0);
    } catch (err) {
        console.error("Foundation reset failed:", err);
        process.exit(1);
    }
};

run();
