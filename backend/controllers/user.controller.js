import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { normalizeRole, isValidRole } from "../utils/role.utils.js";
import { logger } from "../utils/logger.js";

const buildSafeUser = (user) => ({
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profile: user.profile,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const buildCookieOptions = () => ({
    maxAge: env.cookieMaxAgeMs,
    httpOnly: true,
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    secure: env.nodeEnv === "production",
    path: "/",
});

export const register = asyncHandler(async (req, res) => {
    const fullName = req.body.fullName || req.body.fullname || "";
    const phoneNumber = req.body.phone || req.body.phoneNumber || "";
    const emailField = req.body.email || "";
    const passwordField = req.body.password || "";
    const roleField = normalizeRole(req.body.role) || "";

    const normalizedEmail = String(emailField).toLowerCase().trim();

    if (!fullName || !emailField || !passwordField || !roleField) {
        throw new ApiError(400, "Missing required fields");
    }

    if (!isValidRole(roleField)) {
        throw new ApiError(400, "Role must be candidate or recruiter");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(passwordField, 10);

    // Store legacy "Candidate" for DB compatibility, but normalize internally
    const dbRole = roleField === "candidate" ? "Candidate" : roleField;

    const createdUser = await User.create({
        fullname: fullName,
        email: normalizedEmail,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        role: dbRole,
        profile: {
            profilePhoto: "",
        },
    });

    const fileDataUri = req.file ? getDataUri(req.file) : null;
    if (fileDataUri?.content) {
        const maxSizeBytes = (env.uploadMaxSizeMb || 5) * 1024 * 1024;
        if (req.file.size > maxSizeBytes) {
            throw new ApiError(400, `File size exceeds ${env.uploadMaxSizeMb || 5}MB limit`);
        }

        const isImageFile = /^image\//.test(req.file.mimetype);
        if (!isImageFile) {
            throw new ApiError(400, "Only image files are allowed for profile photo");
        }

        const cloudResponse = await cloudinary.uploader.upload(fileDataUri.content);
        createdUser.profile.profilePhoto = cloudResponse.secure_url;
        await createdUser.save();
    }

    const token = jwt.sign(
        {
            userId: createdUser._id.toString(),
            role: normalizeRole(createdUser.role),
        },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );

    const safeUser = buildSafeUser(createdUser);

    res.cookie("token", token, buildCookieOptions());

    return sendSuccess(
        res,
        201,
        {
            user: safeUser,
            token,
        },
        "Account created successfully",
        { user: safeUser, token }
    );
});

export const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
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
        throw new ApiError(403, "Account does not exist with the current role");
    }

    if (!env.jwtSecret) {
        throw new ApiError(500, "JWT secret is not configured");
    }

    if (user.isActive === false) {
        throw new ApiError(403, "Account is deactivated");
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

    return sendSuccess(
        res,
        200,
        {
            user: safeUser,
            token,
        },
        `Welcome back ${safeUser.fullname}`,
        { user: safeUser, token }
    );
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", buildCookieOptions());
    return sendSuccess(res, 200, {}, "Logged out successfully");
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const user = await User.findById(userId);

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
        // Prevent email change to an existing user's email
        if (trimmedEmail !== user.email) {
            const existing = await User.findOne({ email: trimmedEmail });
            if (existing) {
                throw new ApiError(400, "Email is already in use");
            }
            // Mark email as unverified if changing
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
        // Enforce file size limit at controller level
        const maxSizeBytes = (env.uploadMaxSizeMb || 5) * 1024 * 1024;
        if (req.file.size > maxSizeBytes) {
            throw new ApiError(400, `File size exceeds ${env.uploadMaxSizeMb || 5}MB limit`);
        }

        const isResumeFile = /pdf$/i.test(req.file.originalname) || req.file.mimetype === "application/pdf";

        // Only allow PDF for resume; images for profile photo
        const isImageFile = /^image\//.test(req.file.mimetype);

        if (!isResumeFile && !isImageFile) {
            throw new ApiError(400, "Only PDF or image files are allowed");
        }

        const cloudResponse = await cloudinary.uploader.upload(fileDataUri.content);

        if (isResumeFile) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = req.file.originalname;
        } else {
            user.profile.profilePhoto = cloudResponse.secure_url;
        }
    }

    await user.save();

    return sendSuccess(
        res,
        200,
        {
            user: buildSafeUser(user),
        },
        "Profile updated successfully",
        { user: buildSafeUser(user) }
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return sendSuccess(res, 200, { user: buildSafeUser(user) }, "User fetched successfully", { user: buildSafeUser(user) });
});

export const getUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const search = String(req.query.search || req.query.keyword || "").trim();

    // Minimum search length
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
        // Prevent self-demotion if last admin
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
        user.role = normalized === "candidate" ? "Candidate" : normalized;
    }

    await user.save();

    return sendSuccess(res, 200, { user: buildSafeUser(user) }, "User role updated successfully", { user: buildSafeUser(user) });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Cascade: delete user's applications
    const { Application } = await import("../models/application.model.js");
    await Application.deleteMany({ applicant: user._id });

    await User.findByIdAndDelete(req.params.id);

    logger.info(`User deleted: ${user._id} (${user.email})`);

    return sendSuccess(res, 200, { userId: user._id }, "User deleted successfully");
});

