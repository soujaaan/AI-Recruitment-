import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { Resume } from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { InterviewSchedule } from "../models/interviewSchedule.model.js";

import { SEED_VOLUMES } from "./config.js";
import { batchInsert } from "./helpers.js";
import { purgeSeedData } from "./purgeSeedData.js";
import { resetToPreJobPosting } from "./purgeHiringData.js";
import { runHiringSimulation } from "./hiring/orchestrator.js";
import { buildRecruiters } from "./seedRecruiters.js";
import { buildCompanies } from "./seedCompanies.js";
import {
    buildCandidates,
    attachProfilesToUsers,
    buildResumeAnalyses,
    buildResumes,
} from "./seedCandidates.js";

const stripMeta = (docs) =>
    docs.map((d) => {
        const { _seedMeta, _index, _userIndex, ...rest } = d;
        return rest;
    });

const printHiringSummary = async () => {
    const [jobs, applications, interviews, candidates, recruiters] = await Promise.all([
        Job.countDocuments(),
        Application.countDocuments(),
        InterviewSchedule.countDocuments(),
        User.countDocuments({ role: "candidate" }),
        User.countDocuments({ role: "recruiter" }),
    ]);
    console.log(`Jobs:              ${jobs}`);
    console.log(`Applications:      ${applications}`);
    console.log(`Interviews:        ${interviews}`);
    console.log(`Candidates:        ${candidates}`);
    console.log(`Recruiters:        ${recruiters}`);
};

/** Foundation-only seed: recruiters + companies + rich candidate profiles. */
const runFoundationSeed = async () => {
    console.log("=== 1/3 Recruiters ===");
    const recruiterBuilt = await buildRecruiters(SEED_VOLUMES.recruiters);
    const recruiters = await batchInsert(User, stripMeta(recruiterBuilt), "Recruiters");

    console.log("\n=== 2/3 Companies (1 per recruiter) ===");
    const companyDocs = stripMeta(buildCompanies(recruiters.length, recruiters, recruiterBuilt));
    const companies = await batchInsert(Company, companyDocs, "Companies");

    console.log("  → Linking recruiters to companies...");
    await User.bulkWrite(
        recruiters.map((rec, i) => {
            const company = companies[i];
            return {
                updateOne: {
                    filter: { _id: rec._id },
                    update: {
                        $set: {
                            company: company._id,
                            companyId: company._id,
                            profilePhoto: rec.profile?.profilePhoto || "",
                        },
                        $unset: { profile: "" },
                    },
                },
            };
        })
    );

    console.log("\n=== 3/3 Candidates & profiles ===");
    const { users: candidateUsers, profiles: rawProfiles } = await buildCandidates(
        SEED_VOLUMES.candidates
    );
    const candidateDocs = stripMeta(candidateUsers);
    const candidates = await batchInsert(User, candidateDocs, "Candidates");

    console.log("  → Creating Resumes...");
    const resumeDocs = buildResumes(candidates);
    const resumes = await batchInsert(Resume, resumeDocs, "Resumes");

    console.log("  → Creating CandidateProfiles...");
    const profileDocs = attachProfilesToUsers(candidateUsers, rawProfiles, candidates, resumes);
    const profiles = await batchInsert(CandidateProfile, stripMeta(profileDocs), "CandidateProfiles");

    console.log("  → Backfilling User.profile refs...");
    const userBulk = profiles.map((p) => ({
        updateOne: {
            filter: { _id: p.userId },
            update: { $set: { profile: p._id } },
        },
    }));
    if (userBulk.length) await User.bulkWrite(userBulk);

    const analyses = await batchInsert(
        ResumeAnalysis,
        buildResumeAnalyses(candidates, rawProfiles),
        "ResumeAnalyses"
    );

    return { recruiters, companies, candidates, profiles, resumes, analyses };
};

const runSeed = async () => {
    const start = Date.now();
    const freshAccounts = process.argv.includes("--fresh");
    const withHiring = process.argv.includes("--with-hiring");

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.\n");

        if (withHiring && !freshAccounts) {
            await runHiringSimulation();
            await printHiringSummary();
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            console.log(`Duration: ${elapsed}s\n`);
            process.exit(0);
        }

        if (freshAccounts) {
            console.log(
                `Mode: --fresh${withHiring ? " + --with-hiring" : ""} (full account purge + reseed)\n`
            );
            await purgeSeedData();
            await runFoundationSeed();

            if (withHiring) {
                await runHiringSimulation();
            }

            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            console.log("\n=======================================");
            console.log(withHiring ? "✅ FULL SEED COMPLETE (foundation + hiring)" : "✅ FOUNDATION SEED COMPLETE");
            console.log("=======================================");
            await printHiringSummary();
            console.log(`Duration:          ${elapsed}s`);
            console.log("=======================================");
            if (!withHiring) {
                console.log("Rebuild hiring only: npm run seed -- --with-hiring\n");
            }
            process.exit(0);
        }

        console.log("Mode: hiring reset only (preserving existing accounts)\n");
        await resetToPreJobPosting();
        console.log("\n=======================================");
        console.log("✅ HIRING DATA CLEARED (accounts preserved)");
        console.log("=======================================");
        await printHiringSummary();
        console.log("=======================================");
        console.log("Rebuild hiring:  npm run seed -- --with-hiring");
        console.log("Full reseed:     npm run seed:fresh");
        console.log("Full + hiring:   npm run seed:fresh -- --with-hiring\n");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        if (error.details) console.error(error.details.join("\n"));
        process.exit(1);
    }
};

runSeed();
