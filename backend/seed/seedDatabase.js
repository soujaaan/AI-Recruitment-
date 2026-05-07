import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';

import { generateRecruiters } from './recruiters.js';
import { generateCompanies } from './companies.js';
import { generateCandidates } from './candidates.js';
import { generateJobs } from './jobs.js';
import { generateApplications } from './applications.js';

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');

        // 1. Clean Database safely
        console.log('Clearing old collections...');
        await User.deleteMany({ role: { $in: ['candidate', 'recruiter'] } });
        await Company.deleteMany({});
        await Job.deleteMany({});
        await Application.deleteMany({});

        // 2. Generate and Insert Recruiters
        console.log('Generating Recruiters...');
        const recruitersData = await generateRecruiters(10);
        const createdRecruiters = await User.insertMany(recruitersData);
        const recruiterIds = createdRecruiters.map(r => r._id);

        // 3. Generate and Insert Companies
        console.log('Generating Companies...');
        const companiesData = generateCompanies(25, recruiterIds);
        const createdCompanies = await Company.insertMany(companiesData);

        // Update recruiters with company references
        for (let i = 0; i < createdRecruiters.length; i++) {
            // Assign a random company to each recruiter
            const randomCompany = createdCompanies[Math.floor(Math.random() * createdCompanies.length)];
            await User.findByIdAndUpdate(createdRecruiters[i]._id, {
                'profile.company': randomCompany._id
            });
        }

        // 4. Generate and Insert Candidates
        console.log('Generating Candidates...');
        const candidatesData = await generateCandidates(40);
        const createdCandidates = await User.insertMany(candidatesData);

        // 5. Generate and Insert Jobs
        console.log('Generating Jobs...');
        const jobsData = generateJobs(100, createdCompanies, createdRecruiters);
        const createdJobs = await Job.insertMany(jobsData);

        // 6. Generate and Insert Applications
        console.log('Generating Applications...');
        const applicationsData = generateApplications(300, createdCandidates, createdJobs);
        const createdApplications = await Application.insertMany(applicationsData);

        // Update Jobs with Application References
        console.log('Updating Job application references...');
        for (const app of createdApplications) {
            await Job.findByIdAndUpdate(app.job, {
                $push: { applications: app._id }
            });
        }

        console.log('\n=======================================');
        console.log('✅ SEEDING COMPLETE');
        console.log('=======================================');
        console.log(`✓ Companies Created: ${createdCompanies.length}`);
        console.log(`✓ Recruiters Created: ${createdRecruiters.length}`);
        console.log(`✓ Candidates Created: ${createdCandidates.length}`);
        console.log(`✓ Skills Categorized: 150+`);
        console.log(`✓ Jobs Created: ${createdJobs.length}`);
        console.log(`✓ Applications Created: ${createdApplications.length}`);
        console.log('=======================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedDB();
