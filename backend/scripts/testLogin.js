import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

// Import our models/utils so we use exactly the same code
import { User } from '../models/user.model.js';
import { normalizeRole } from '../utils/role.utils.js';

async function run() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully.');

        const email = 'connect.soujan@gmail.com';
        const password = 'adminhiresense';
        
        console.log(`\nSimulating login workflow for: ${email}`);
        
        // 1. Fetch user (select password)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.error('FAIL: User not found in database.');
            process.exit(1);
        }
        console.log('✓ User found in database.');

        // 2. Match password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.error('FAIL: Password match failed.');
            process.exit(1);
        }
        console.log('✓ Password match succeeded.');

        // 3. Conditional profile population logic (re-implemented exactly as in controller)
        console.log('Running conditional profile population...');
        const userRole = normalizeRole(user.role);
        console.log(`User Role: ${user.role} (normalized: ${userRole})`);

        if (user && userRole === 'candidate') {
            console.log('Attempting to populate candidate profile...');
            await user.populate('profile');
            console.log('✓ Candidate profile populated successfully.');
        } else {
            console.log('✓ User is not a candidate. Skipping profile population query (CastError prevented).');
        }

        // 4. Check active/blocked state
        if (user.isActive === false) {
            console.error('FAIL: User is deactivated.');
            process.exit(1);
        }
        if (user.isBlocked) {
            console.error('FAIL: User is blocked.');
            process.exit(1);
        }
        console.log('✓ User status active and unblocked.');

        console.log('\n=======================================');
        console.log('🎉 SUCCESS: Login workflow completed without errors!');
        console.log(`User ID: ${user._id}`);
        console.log(`User Email: ${user.email}`);
        console.log(`User Role: ${user.role}`);
        console.log('=======================================\n');

    } catch (error) {
        console.error('💥 ERROR during simulated login:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

run();
