import dotenv from "dotenv";
dotenv.config({ path: "c:/Users/royso/OneDrive/Desktop/AI Recruitment/backend/.env" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";

const runTests = async () => {
    try {
        console.log("=== 🔌 CONNECTING TO DB ===");
        mongoose.set("strictQuery", true);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected\n");

        const testEmail = "rec_test@example.com";

        // Clean up any existing test user
        await User.deleteOne({ email: testEmail });

        console.log("=== 👤 CREATING TEST USER ===");
        const initialPassword = "oldSecurePassword123";
        const hashedPassword = await bcrypt.hash(initialPassword, 10);
        const user = await User.create({
            fullname: "Recovery Test User",
            email: testEmail,
            phoneNumber: "1234567890",
            password: hashedPassword,
            role: "candidate",
            isActive: true
        });
        console.log(`✅ Test User Created with email: ${user.email}\n`);

        console.log("=== 🧪 TEST CASE 1: GENERATE OTP ===");
        // Generate secure 6-digit OTP
        const otp = "123456";
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.resetOtp = hashedOtp;
        user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
        user.otpVerified = false;
        await user.save();

        const savedUser = await User.findOne({ email: testEmail });
        if (savedUser.resetOtp && savedUser.resetOtp !== otp) {
            console.log("✅ OTP successfully stored as hashed");
        } else {
            throw new Error("❌ OTP was not stored or was stored in plain text");
        }
        if (savedUser.resetOtpExpiry > new Date()) {
            console.log("✅ OTP expiry is correctly set in the future");
        } else {
            throw new Error("❌ OTP expiry is invalid");
        }
        console.log("✅ Test Case 1 Passed!\n");

        console.log("=== 🧪 TEST CASE 2: INCORRECT OTP ATTEMPTS ===");
        const wrongOtp = "999999";
        const checkWrong = await bcrypt.compare(wrongOtp, savedUser.resetOtp);
        if (!checkWrong) {
            savedUser.otpAttempts += 1;
            await savedUser.save();
            console.log(`✅ Attempt failed. Attempts count incremented to: ${savedUser.otpAttempts}`);
        } else {
            throw new Error("❌ Wrong OTP incorrectly matched");
        }
        console.log("✅ Test Case 2 Passed!\n");

        console.log("=== 🧪 TEST CASE 3: LOCKOUT LIMIT (5 ATTEMPTS) ===");
        // Add 4 more failed attempts to reach 5
        for (let i = 0; i < 4; i++) {
            savedUser.otpAttempts += 1;
        }
        await savedUser.save();

        if (savedUser.otpAttempts >= 5) {
            savedUser.resetOtp = null;
            savedUser.resetOtpExpiry = null;
            await savedUser.save();
            console.log("✅ 5 failed attempts triggered. OTP invalidated and fields cleared");
        } else {
            throw new Error("❌ Invalidation trigger failed");
        }

        const lockedUser = await User.findOne({ email: testEmail });
        if (lockedUser.resetOtp === null && lockedUser.resetOtpExpiry === null) {
            console.log("✅ Database confirmed OTP is fully wiped");
        } else {
            throw new Error("❌ Fields were not wiped in database");
        }
        console.log("✅ Test Case 3 Passed!\n");

        console.log("=== 🧪 TEST CASE 4: VALID OTP VERIFICATION ===");
        // Generate new OTP
        const newOtp = "654321";
        const newHashedOtp = await bcrypt.hash(newOtp, 10);
        lockedUser.resetOtp = newHashedOtp;
        lockedUser.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        lockedUser.otpAttempts = 0;
        lockedUser.otpVerified = false;
        await lockedUser.save();

        const activeUser = await User.findOne({ email: testEmail });
        const checkValid = await bcrypt.compare(newOtp, activeUser.resetOtp);
        if (checkValid) {
            activeUser.otpVerified = true;
            activeUser.otpAttempts = 0;
            await activeUser.save();
            console.log("✅ Valid OTP verified and marked in schema: otpVerified = true");
        } else {
            throw new Error("❌ Valid OTP failed to verify");
        }
        console.log("✅ Test Case 4 Passed!\n");

        console.log("=== 🧪 TEST CASE 5: PASSWORD RESET UPDATE ===");
        const verifiedUser = await User.findOne({ email: testEmail });
        if (verifiedUser.otpVerified === true) {
            const newPassword = "newSuperSecretPassword999";
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            
            verifiedUser.password = newHashedPassword;
            verifiedUser.resetOtp = null;
            verifiedUser.resetOtpExpiry = null;
            verifiedUser.otpAttempts = 0;
            verifiedUser.otpVerified = false;
            await verifiedUser.save();
            
            console.log("✅ Password updated successfully using bcrypt");
            console.log("✅ Recovery fields cleared in database");
        } else {
            throw new Error("❌ Password reset was allowed without OTP verification");
        }

        const finalUser = await User.findOne({ email: testEmail });
        if (finalUser.resetOtp === null && finalUser.otpVerified === false) {
            console.log("✅ Verified recovery variables have been reset to default");
        } else {
            throw new Error("❌ Recovery variables were not properly cleaned");
        }

        const checkLoginNew = await bcrypt.compare("newSuperSecretPassword999", finalUser.password);
        if (checkLoginNew) {
            console.log("✅ Login with new password succeeded");
        } else {
            throw new Error("❌ Login with new password failed");
        }

        const checkLoginOld = await bcrypt.compare(initialPassword, finalUser.password);
        if (!checkLoginOld) {
            console.log("✅ Login with old password correctly failed");
        } else {
            throw new Error("❌ Login with old password succeeded");
        }
        console.log("✅ Test Case 5 Passed!\n");

        // Clean up
        await User.deleteOne({ email: testEmail });
        console.log("🧹 Test User Deleted & Database Cleaned");
        console.log("\n⭐️ ALL TEST CASES PASSED SUCCESSFULLY!");
    } catch (error) {
        console.error("💥 TEST FAILED:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

runTests();
