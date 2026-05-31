import express from "express";
import rateLimit from "express-rate-limit";
import { profilePhotoUpload } from "../middlewares/upload.middleware.js";
import { sendOtp, verifyOtp, resendOtp, forgotPassword, resetPassword, verifyResetOtp } from "../controllers/user.controller.js";
import { validateRegistration } from "../middlewares/validation.middleware.js";

const router = express.Router();

const limiterOptions = {
    standardHeaders: true,
    legacyHeaders: false,
};

const sendOtpLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many OTP requests. Please wait 5 minutes." },
    keyGenerator: (req) => `${req.ip}_${String(req.body?.email || "").toLowerCase()}`,
});

const verifyOtpLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many verification attempts. Please try again later." },
    keyGenerator: (req) => `${req.ip}_${String(req.body?.email || "").toLowerCase()}`,
});

const resendOtpLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many resend requests. Please wait 5 minutes." },
    keyGenerator: (req) => `${req.ip}_${String(req.body?.email || "").toLowerCase()}`,
});

const forgotPasswordLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many requests. Please wait 10 minutes." },
    keyGenerator: (req) => `${req.ip}_${String(req.body?.email || "").toLowerCase()}`,
});

const verifyResetOtpLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
    keyGenerator: (req) => `${req.ip}_${String(req.body?.email || "").toLowerCase()}`,
});

const resetPasswordLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many password resets. Please wait 10 minutes." },
    keyGenerator: (req) => `${req.ip}_${String(req.body?.email || "").toLowerCase()}`,
});

router.post("/send-otp", sendOtpLimiter, profilePhotoUpload, validateRegistration, sendOtp);
router.post("/resend-otp", resendOtpLimiter, resendOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-otp", verifyResetOtpLimiter, verifyResetOtp);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

export default router;
