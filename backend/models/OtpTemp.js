import mongoose from "mongoose";

const otpTempSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePhoto: { type: String, default: "" },
    
    otp: { type: String, required: true }, // Hashed
    otpExpires: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now }
}, { timestamps: true });

otpTempSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export const OtpTemp = mongoose.model('OtpTemp', otpTempSchema);
