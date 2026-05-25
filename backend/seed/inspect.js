import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const runInspect = async () => {
    try {
        console.log("Connecting to", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        
        const db = mongoose.connection.db;
        const applications = await db.collection("applications").find().toArray();
        console.log(`Total applications found: ${applications.length}`);
        
        if (applications.length > 0) {
            console.log("First application document sample:");
            console.log(JSON.stringify(applications[0], null, 2));
            
            // Check sample field types
            const first = applications[0];
            console.log("Field types in first application:");
            console.log("- candidateId:", typeof first.candidateId, first.candidateId?.constructor?.name);
            console.log("- applicant:", typeof first.applicant, first.applicant?.constructor?.name);
            console.log("- jobId:", typeof first.jobId, first.jobId?.constructor?.name);
            console.log("- job:", typeof first.job, first.job?.constructor?.name);
        }

        // Run validation check
        let brokenCandidateCount = 0;
        let brokenJobCount = 0;
        let stringIdCount = 0;
        let undefinedIdCount = 0;
        
        for (const app of applications) {
            const cid = app.candidateId || app.applicant;
            const jid = app.jobId || app.job;
            
            if (!cid) {
                undefinedIdCount++;
                continue;
            }
            
            if (typeof cid === "string" && !mongoose.Types.ObjectId.isValid(cid)) {
                stringIdCount++;
            }
            
            let userExists = null;
            try {
                userExists = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(cid) });
            } catch (e) {
                // If casting failed, it's definitely a broken reference
            }
            if (!userExists) {
                brokenCandidateCount++;
            }
            
            if (jid) {
                let jobExists = null;
                try {
                    jobExists = await db.collection("jobs").findOne({ _id: new mongoose.Types.ObjectId(jid) });
                } catch (e) {
                    // Casting failed
                }
                if (!jobExists) {
                    brokenJobCount++;
                }
            }
        }
        
        console.log(`\nValidation results:`);
        console.log(`- Undefined / missing candidateId: ${undefinedIdCount}`);
        console.log(`- Non-ObjectId string candidateId: ${stringIdCount}`);
        console.log(`- Applications pointing to non-existent users: ${brokenCandidateCount}`);
        console.log(`- Applications pointing to non-existent jobs: ${brokenJobCount}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

runInspect();
