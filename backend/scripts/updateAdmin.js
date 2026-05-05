import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';
const TARGET_EMAIL = 'roysoujan28@gmail.com';
const TARGET_PASSWORD = 'adminsoujan';

// Define User Schema (same as application to ensure compatibility)
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Candidate', 'candidate', 'recruiter', 'admin'], required: true },
    profile: {
        bio: { type: String, trim: true, default: "" },
        skills: [{ type: String, trim: true }],
        resume: { type: String },
        resumeOriginalName: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto: { type: String, default: "" }
    },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        // 1. Backup existing users collection
        console.log('Creating backup of users collection...');
        const backupCollectionName = `users_backup_${Date.now()}`;
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        if (users.length > 0) {
            await mongoose.connection.db.collection(backupCollectionName).insertMany(users);
            console.log(`Backup created successfully: ${backupCollectionName} (${users.length} records)`);
        } else {
            console.log('No users found to backup.');
        }

        // 2. Find all users with role "admin"
        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} existing admin(s).`);

        // Check if TARGET_EMAIL is already used by a NON-ADMIN user
        const existingEmailUser = await User.findOne({ email: TARGET_EMAIL });
        if (existingEmailUser && existingEmailUser.role !== 'admin') {
            console.log(`Warning: A NON-ADMIN user already exists with email ${TARGET_EMAIL}.`);
            console.log(`To ensure uniqueness without deleting non-admin users, we will append a suffix to the non-admin's email.`);
            existingEmailUser.email = `old_${Date.now()}_${TARGET_EMAIL}`;
            await existingEmailUser.save();
            console.log(`Changed non-admin email to: ${existingEmailUser.email}`);
        }

        let primaryAdmin;

        if (admins.length === 0) {
            // 3. Create a new admin user if none exists
            console.log('No admin found. Creating a new admin...');
            
            // Check if there is an existing admin with the exact email that we modified above? No, above was non-admin.
            const hashedPassword = await bcrypt.hash(TARGET_PASSWORD, 10);
            
            primaryAdmin = new User({
                fullname: 'System Admin',
                email: TARGET_EMAIL,
                phoneNumber: '0000000000',
                password: hashedPassword,
                role: 'admin'
            });
            await primaryAdmin.save();
            console.log('New admin created successfully.');
        } else {
            // If multiple admins exist, keep one and delete others
            primaryAdmin = admins.find(a => a.email === TARGET_EMAIL) || admins[0];
            const otherAdmins = admins.filter(a => a._id.toString() !== primaryAdmin._id.toString());
            
            if (otherAdmins.length > 0) {
                console.log(`Deleting ${otherAdmins.length} duplicate admin(s)...`);
                const otherAdminIds = otherAdmins.map(a => a._id);
                await User.deleteMany({ _id: { $in: otherAdminIds } });
                console.log('Duplicate admins deleted.');
            }

            // Update primary admin email if not already matching
            if (primaryAdmin.email !== TARGET_EMAIL) {
                console.log(`Updating primary admin email from ${primaryAdmin.email} to ${TARGET_EMAIL}...`);
                primaryAdmin.email = TARGET_EMAIL;
                await primaryAdmin.save();
                console.log('Admin email updated successfully.');
            } else {
                console.log('Primary admin already has the correct email.');
            }
        }

        // 5. Validation
        const finalAdmins = await User.find({ role: 'admin' });
        console.log(`\n--- Validation ---`);
        console.log(`Total admins in database: ${finalAdmins.length}`);
        if (finalAdmins.length === 1 && finalAdmins[0].email === TARGET_EMAIL) {
            console.log('SUCCESS: Only one admin exists, and the email matches exactly.');
            console.log(`Admin ID: ${finalAdmins[0]._id}`);
            console.log(`Admin Email: ${finalAdmins[0].email}`);
        } else {
            console.error('FAILED: Validation failed. Current admins:');
            console.error(finalAdmins);
        }
        
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

run();
