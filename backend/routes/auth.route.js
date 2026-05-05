import express from "express";
import rateLimit from "express-rate-limit";
import { profilePhotoUpload } from "../middlewares/upload.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/user.controller.js";
import { validateRegistration } from "../middlewares/validation.middleware.js";

const router = express.Router();

const sendOtpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: { success: false, message: "Too many OTP requests. Please wait 5 minutes." },
    keyGenerator: (req) => req.ip + "_" + (req.body.email || "")
});

const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many verification attempts. Please try again later." },
    keyGenerator: (req) => req.ip + "_" + (req.body.email || "")
});

router.post("/send-otp", sendOtpLimiter, profilePhotoUpload, validateRegistration, sendOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);

export default router;
