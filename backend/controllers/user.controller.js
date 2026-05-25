import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as fs from "fs/promises";
import path from "path";
import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";

import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { sendOTP } from "../utils/email.js";
import crypto from "crypto";
import { OtpTemp } from "../models/OtpTemp.js";

import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { normalizeRole, isValidRole } from "../utils/role.utils.js";
import { logger } from "../utils/logger.js";

const buildSafeUser = (user) => {
    const profile = (user?.profile && typeof user.profile === "object")
        ? (user.profile.toObject ? user.profile.toObject() : user.profile)
        : {};
        
    const skills = profile.skills || [];
    const resume = profile.resume || "";
    const resumeUrl = profile.resumeUrl || profile.resumePdfUrl || resume || "";
    const resumeOriginalName = profile.resumeOriginalName || "";

    return {
        _id: user?._id,
        fullname: user?.fullname,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        role: normalizeRole(user?.role),
        profile: {
            ...profile,
            skills,
            resume,
            resumeUrl,
            resumeOriginalName,
        },
        skills,
        resume,
        resumeUrl,
        resumeOriginalName,
        isActive: user?.isActive,
        lastLoginAt: user?.lastLoginAt,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
    };
};

const buildCookieOptions = () => ({
    maxAge: env.cookieMaxAgeMs,
    httpOnly: true,
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    secure: env.nodeEnv === "production",
    path: "/",
});

export const sendOtp = asyncHandler(async (req, res) => {
    const fullName = req.body.fullName || req.body.fullname || "";
    const phoneNumber = req.body.phone || req.body.phoneNumber || "";
    const emailField = req.body.email || "";
    const passwordField = req.body.password || "";
    const roleField = normalizeRole(req.body.role) || "";

    const normalizedEmail = String(emailField).toLowerCase().trim();

    if (!fullName || !emailField || !passwordField || !roleField) {
        throw new ApiError(400, "Full name, email, password, and role are required");
    }

    if (!isValidRole(roleField)) {
        throw new ApiError(400, "Role must be 'candidate' or 'recruiter'");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email. Please login.");
    }

    const existingTemp = await OtpTemp.findOne({ email: normalizedEmail });
    if (existingTemp) {
        const now = new Date();
        const timeSinceLastSent = (now.getTime() - existingTemp.lastSentAt.getTime()) / 1000;
        if (timeSinceLastSent < 60) {
            throw new ApiError(429, `Please wait ${Math.ceil(60 - timeSinceLastSent)}s before resending OTP.`);
        }
        if (existingTemp.attempts >= 3) {
            throw new ApiError(429, "Too many OTP requests. Please try again later.");
        }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const hashedPassword = await bcrypt.hash(passwordField, 10);
    const dbRole = roleField === "candidate" ? "candidate" : roleField;

    let profilePhotoUrl = "";
    if (req.file) {
        const fileDataUri = getDataUri(req.file);
        if (fileDataUri?.content) {
            const maxSizeBytes = (env.uploadMaxSizeMb || 5) * 1024 * 1000;
            if (req.file.size > maxSizeBytes) {
                throw new ApiError(400, `File size exceeds ${env.uploadMaxSizeMb || 5}MB limit`);
            }
            if (!/^image\//.test(req.file.mimetype)) {
                throw new ApiError(400, "Only image files allowed for profile photo");
            }
            const cloudResponse = await cloudinary.uploader.upload(fileDataUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }
    }

    await OtpTemp.findOneAndUpdate(
        { email: normalizedEmail },
        {
            fullname: fullName,
            phoneNumber: phoneNumber,
            password: hashedPassword,
            role: dbRole,
            profilePhoto: profilePhotoUrl,
            otp: hashedOtp,
            otpExpires,
            lastSentAt: new Date(),
            $inc: { attempts: existingTemp ? 1 : 0 }
        },
        { upsert: true, new: true }
    );

    try {
        await sendOTP(normalizedEmail, otp);
    } catch (error) {
        logger.error(`Failed to send OTP to ${normalizedEmail}:`, error);
        throw new ApiError(500, "Failed to send verification email. Please try again.");
    }

    return sendSuccess(res, 200, null, "OTP sent successfully to your email.");
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const tempUser = await OtpTemp.findOne({ email: normalizedEmail });

    if (!tempUser) {
        throw new ApiError(400, "OTP session expired or not found. Please register again.");
    }

    if (new Date() > tempUser.otpExpires) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    if (tempUser.attempts > 5) {
        throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
    }

    const hashedInputOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedInputOtp !== tempUser.otp) {
        tempUser.attempts += 1;
        await tempUser.save();
        throw new ApiError(400, "Invalid OTP");
    }

    // OTP is valid -> Create final user
    const user = new User({
        fullname: tempUser.fullname,
        email: tempUser.email,
        phoneNumber: tempUser.phoneNumber,
        password: tempUser.password, // already hashed
        role: tempUser.role,
        profile: { profilePhoto: tempUser.profilePhoto },
        isEmailVerified: true
    });

    await user.save();
    await OtpTemp.deleteOne({ _id: tempUser._id });

    logger.info(`User registered via OTP: ${user.email} (${user.role})`);
    
    // We navigate to login directly, no token needed for now as per the prompt logic ("navigate('/login')")
    return sendSuccess(res, 201, { userId: user._id }, "Registration and verification successful!");
});

export const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password").populate("profile");
    if (!user) {
        throw new ApiError(401, "Incorrect email or password");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Incorrect email or password");
    }

    const normalizedUserRole = normalizeRole(user.role);
    const normalizedInputRole = normalizeRole(role);

    if (normalizedInputRole && normalizedInputRole !== normalizedUserRole) {
        throw new ApiError(403, "Account does not exist with this role");
    }

    if (!env.jwtSecret) {
        throw new ApiError(500, "Server configuration error");
    }

    if (user.isActive === false) {
        throw new ApiError(403, "Account is deactivated");
    }

    if (user.isBlocked) {
        throw new ApiError(403, "Account is blocked");
    }

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            role: normalizedUserRole,
        },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );

    user.lastLoginAt = new Date();
    await user.save();

    const safeUser = buildSafeUser(user);

    res.cookie("token", token, buildCookieOptions());

    logger.info(`User logged in: ${user.email} (${normalizedUserRole})`);

    return sendSuccess(
        res,
        200,
        {
            user: safeUser,
            token,
        },
        `Welcome back, ${safeUser.fullname}!`,
        { user: safeUser, token }
    );
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", buildCookieOptions());
    return sendSuccess(res, 200, {}, "Logged out successfully");
});

export const updateProfile = asyncHandler(async (req, res) => {
    console.log("Update Profile - req.body:", req.body);
    console.log("Update Profile - req.file:", req.file);
    
    const userId = req.user?.id || req.id;
    const user = await User.findById(userId).populate("profile");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { fullname, email, phoneNumber, bio, skills } = req.body;

    if (fullname !== undefined) {
        const trimmed = String(fullname).trim();
        if (trimmed.length === 0) {
            throw new ApiError(400, "Full name cannot be empty");
        }
        user.fullname = trimmed;
    }

    if (email !== undefined) {
        const trimmedEmail = String(email).toLowerCase().trim();
        if (trimmedEmail.length === 0) {
            throw new ApiError(400, "Email cannot be empty");
        }
        if (trimmedEmail !== user.email) {
            const existing = await User.findOne({ email: trimmedEmail });
            if (existing) {
                throw new ApiError(400, "Email is already in use");
            }
            user.email = trimmedEmail;
        }
    }

    if (phoneNumber !== undefined) {
        const trimmed = String(phoneNumber).trim();
        if (trimmed.length === 0) {
            throw new ApiError(400, "Phone number cannot be empty");
        }
        user.phoneNumber = trimmed;
    }

    if (bio !== undefined) {
        user.profile.bio = String(bio).trim();
    }

    if (skills !== undefined) {
        user.profile.skills = Array.isArray(skills)
            ? skills.map((skill) => String(skill).trim()).filter(Boolean)
            : String(skills)
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);
    }

    const fileDataUri = req.file ? getDataUri(req.file) : null;
    if (fileDataUri?.content) {
        const maxSizeBytes = (env.uploadMaxSizeMb || 5) * 1024 * 1024;
        if (req.file.size > maxSizeBytes) {
            throw new ApiError(400, `File size exceeds ${env.uploadMaxSizeMb || 5}MB limit`);
        }

        const isResumeFile = /pdf$/i.test(req.file.originalname) || req.file.mimetype === "application/pdf";

        const isImageFile = /^image\//.test(req.file.mimetype);

        if (!isResumeFile && !isImageFile) {
            throw new ApiError(400, "Only PDF or image files are allowed");
        }

        const cloudResponse = await cloudinary.uploader.upload(fileDataUri.content);

        if (isResumeFile) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = req.file.originalname;

            let resumeDoc = await Resume.findOne({ userId: user._id });
            if (resumeDoc) {
                resumeDoc.fileUrl = cloudResponse.secure_url;
                resumeDoc.parsedData = null;
                await resumeDoc.save();
            } else {
                await Resume.create({
                    userId: user._id,
                    fileUrl: cloudResponse.secure_url,
                    parsedData: null
                });
            }

            // AI Resume Screening & ATS Scoring Pipeline (deterministic ML via Flask)
            try {
                logger.info(`ATS analysis trigger after upload for user ${user._id}, file: ${req.file.path}`);

                const pdfBuffer = await fs.readFile(req.file.path);
                const pdfModule = await import("pdf-parse");
                const pdfParse = pdfModule.default;
                const pdfData = await pdfParse(pdfBuffer);
                let text = pdfData?.text?.trim() || '';

                // Clean text for logging only; Flask also cleans internally
                text = text.replace(/\s+/g, ' ').trim();

                logger.info(`Extracted resume text length=${text.length} for user ${user._id}`);
                if (text.length < 200) {
                    logger.warn(`Resume text too short (<200). Will NOT call Flask ML. user=${user._id}`);
                } else {
                    // Call Flask ATS service via the existing deterministic pipeline
                    const { aiAnalyzeResume } = await import("../services/resumeAnalysis.service.js");
                    const ml = await aiAnalyzeResume(text);
                    logger.info(`Flask ATS returned for user ${user._id}`, {
                        atsScore: ml?.atsScore,
                        predictedRole: ml?.predictedRole,
                    });

                    const deterministicAnalysis = {
                        atsScore: ml?.atsScore ?? 0,
                        predictedRole: ml?.predictedRole ?? "",
                        skills: Array.isArray(ml?.skills) ? ml.skills : [],
                        strengths: Array.isArray(ml?.strengths) ? ml.strengths : [],
                        weaknesses: Array.isArray(ml?.weaknesses) ? ml.weaknesses : [],
                        recommendations: Array.isArray(ml?.recommendations) ? ml.recommendations : [],
                    };

                    const persisted = { success: true, analysis: deterministicAnalysis };
                    let resumeDoc = await Resume.findOne({ userId: user._id });
                    if (resumeDoc) {
                        resumeDoc.parsedData = persisted;
                        await resumeDoc.save();
                    } else {
                        // Safety: should not happen because we just created/updated it above
                        await Resume.create({
                            userId: user._id,
                            fileUrl: cloudResponse.secure_url,
                            parsedData: persisted,
                        });
                    }

                    await ResumeAnalysis.create({
                        userId: user._id,
                        atsScore: deterministicAnalysis.atsScore,
                        predictedRole: deterministicAnalysis.predictedRole,
                        skills: deterministicAnalysis.skills,
                        strengths: deterministicAnalysis.strengths,
                        weaknesses: deterministicAnalysis.weaknesses,
                        recommendations: deterministicAnalysis.recommendations,
                        analyzedAt: new Date(),
                    });

                    logger.info(`ATS analysis persisted successfully for user ${user._id}`);
                }
            } catch (error) {
                logger.error(`ATS analysis failed for ${user.email}:`, error);
            }

        } else {
            user.profile.profilePhoto = cloudResponse.secure_url;
        }
    }

    await user.save();

    // Get latest ATS analysis for response
    const latestAnalysis = await ResumeAnalysis.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean();

    const responseData = {
        user: buildSafeUser(user)
    };

    if (latestAnalysis) {
        responseData.atsAnalysis = {
            atsScore: latestAnalysis.atsScore,
            predictedRole: latestAnalysis.predictedRole,
            skills: latestAnalysis.skills,
            strengths: latestAnalysis.strengths,
            weaknesses: latestAnalysis.weaknesses,
            recommendations: latestAnalysis.recommendations
        };
    }

    return sendSuccess(
        res,
        200,
        responseData,
        "Profile updated successfully",
        responseData
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const user = await User.findById(userId).populate("profile");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log("[getCurrentUser] User document:", user);

    return sendSuccess(res, 200, { user: buildSafeUser(user) }, "User fetched successfully", { user: buildSafeUser(user) });
});

export const getUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const search = String(req.query.search || req.query.keyword || "").trim();

    if (search && search.length < 3) {
        throw new ApiError(400, "Search query must be at least 3 characters");
    }

    const query = search
        ? {
              $text: {
                  $search: search,
              },
          }
        : {};

    const totalUsers = await User.countDocuments(query);
    const usersQuery = User.find(query)
        .skip(skip)
        .limit(limit)
        .select("-password");

    if (search) {
        usersQuery.sort({ score: { $meta: "textScore" } });
    } else {
        usersQuery.sort({ createdAt: -1 });
    }

    const users = await usersQuery;

    return sendSuccess(
        res,
        200,
        {
            users,
            pagination: buildPaginationMeta(totalUsers, page, limit),
        },
        "Users fetched successfully",
        { users }
    );
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (req.body.role) {
        const normalized = normalizeRole(req.body.role);
        if (!isValidRole(normalized)) {
            throw new ApiError(400, "Invalid role");
        }
        if (
            normalizeRole(user.role) === "admin" &&
            normalized !== "admin" &&
            String(user._id) === String(req.user?.id)
        ) {
            const adminCount = await User.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                throw new ApiError(400, "Cannot demote the last admin");
            }
        }
        user.role = normalized === "candidate" ? "candidate" : normalized;
    }

    await user.save();

    return sendSuccess(res, 200, { user: buildSafeUser(user) }, "User role updated successfully", { user: buildSafeUser(user) });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { Application } = await import("../models/application.model.js");
    await Application.deleteMany({ applicant: user._id });

    await User.findByIdAndDelete(req.params.id);

    logger.info(`User deleted: ${user._id} (${user.email})`);

    return sendSuccess(res, 200, { userId: user._id }, "User deleted successfully");
});
