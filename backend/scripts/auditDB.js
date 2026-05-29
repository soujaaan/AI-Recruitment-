import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

// Define User Schema (minimal for querying)
const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    phoneNumber: String,
    role: String,
    isActive: Boolean,
    isBlocked: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        // 1. Total users count
        const totalUsers = await User.countDocuments();
        console.log(`\n=== 1. TOTAL USERS COUNT ===\n${totalUsers}`);

        // 2. Count by role
        // Let's find all distinct roles first to see if there is any casing or corrupt roles
        const distinctRoles = await User.distinct('role');
        console.log(`\n=== 2. DISTINCT ROLES IN DB ===\n`, distinctRoles);

        const countsByRole = {};
        for (const r of distinctRoles) {
            countsByRole[r] = await User.countDocuments({ role: r });
        }
        console.log(`Users count by role:`, countsByRole);

        // 3. Search specifically for the emails
        const emailsToCheck = ['roysoujan28@gmail.com', 'connect.soujan@gmail.com'];
        console.log(`\n=== 3. SEARCHING FOR SPECIFIC ACCOUNTS ===`);
        for (const email of emailsToCheck) {
            // Case insensitive search
            const users = await User.find({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
            console.log(`\nResults for "${email}":`);
            if (users.length === 0) {
                console.log('Not found in database.');
            } else {
                users.forEach(u => {
                    const { password, ...safeRecord } = u;
                    console.log(JSON.stringify(safeRecord, null, 2));
                });
            }
        }

        // 4. All admin accounts
        console.log(`\n=== 4. ALL ADMIN USERS IN DB ===`);
        // Find admin case-insensitively just in case
        const admins = await User.find({ role: { $regex: /admin/i } }).lean();
        if (admins.length === 0) {
            console.log('No admin users found in database.');
        } else {
            admins.forEach(u => {
                const { password, ...safeRecord } = u;
                console.log(JSON.stringify(safeRecord, null, 2));
            });
        }

    } catch (error) {
        console.error('An error occurred during database audit:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

run();
