import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { normalizeRole } from "../utils/role.utils.js";

const allowedApplicationStatuses = ["pending", "accepted", "rejected", "applied", "shortlisted"];
const allowedSignupRoles = ["candidate", "recruiter", "student", "Candidate"];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
const isStrongPassword = (value) => typeof value === "string" && value.length >= 8;
const isValidPhoneNumber = (value) => /^[0-9\+\-\s]{7,20}$/.test(String(value || ""));
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeArrayFromBody = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

const ensureObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const validateRegistration = (req, res, next) => {
    const fullName = req.body.fullName || req.body.fullname || "";
    const phone = req.body.phone || req.body.phoneNumber || "";
    const { email, password, role: roleInput } = req.body;
    const role = normalizeRole(roleInput) || "";

    if (!isNonEmptyString(fullName)) {
        return next(new ApiError(400, "Full name is required"));
    }
    if (!isValidEmail(email)) {
        return next(new ApiError(400, "Valid email is required"));
    }
    if (phone && !isValidPhoneNumber(phone)) {
        return next(new ApiError(400, "Valid phone number is required"));
    }
    if (!isStrongPassword(password)) {
        return next(new ApiError(400, "Password must be at least 8 characters long"));
    }
    if (!role || (role !== "candidate" && role !== "recruiter")) {
        return next(new ApiError(400, "Role must be candidate or recruiter"));
    }
    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password, role } = req.body;

    if (!isValidEmail(email)) {
        return next(new ApiError(400, "Valid email is required"));
    }
    if (!password || typeof password !== "string" || password.length < 1) {
        return next(new ApiError(400, "Password is required"));
    }
    const normalizedRole = normalizeRole(role);
    if (role && (!normalizedRole || !["candidate", "recruiter", "admin"].includes(normalizedRole))) {
        return next(new ApiError(400, "Valid role is required"));
    }
    next();
};

export const validateJobCreation = (req, res, next) => {
    const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

    if (!isNonEmptyString(title)) {
        return next(new ApiError(400, "Job title is required"));
    }
    if (!isNonEmptyString(description)) {
        return next(new ApiError(400, "Job description is required"));
    }
    if (!requirements || (!Array.isArray(requirements) && !isNonEmptyString(requirements))) {
        return next(new ApiError(400, "Job requirements are required"));
    }
    if (!Number.isFinite(Number(salary)) || Number(salary) <= 0) {
        return next(new ApiError(400, "Valid salary is required"));
    }
    if (!isNonEmptyString(location)) {
        return next(new ApiError(400, "Job location is required"));
    }
    if (!isNonEmptyString(jobType)) {
        return next(new ApiError(400, "Job type is required"));
    }
    if (!Number.isFinite(Number(experience)) || Number(experience) < 0) {
        return next(new ApiError(400, "Valid experience is required"));
    }
    if (!Number.isFinite(Number(position)) || Number(position) <= 0) {
        return next(new ApiError(400, "Valid position count is required"));
    }
    if (!ensureObjectId(companyId)) {
        return next(new ApiError(400, "companyId is invalid"));
    }

    req.body.requirements = normalizeArrayFromBody(requirements);
    req.body.salary = Number(salary);
    req.body.experience = Number(experience);
    req.body.position = Number(position);
    next();
};

export const validateApplicationSubmission = (req, res, next) => {
    const jobId = req.params.id || req.params.jobId;

    if (!jobId) {
        return next(new ApiError(400, "Job id is required"));
    }
    if (!ensureObjectId(jobId)) {
        return next(new ApiError(400, "jobId is invalid"));
    }
    next();
};

export const validateStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    const normalizedStatus = String(status || "").toLowerCase();

    if (!allowedApplicationStatuses.includes(normalizedStatus)) {
        return next(new ApiError(400, "Valid status is required"));
    }

    if (normalizedStatus === "pending") {
        req.body.status = "applied";
    } else if (normalizedStatus === "accepted") {
        req.body.status = "shortlisted";
    } else {
        req.body.status = normalizedStatus;
    }
    next();
};

export const validateObjectIdParam = (paramName) => {
    return (req, res, next) => {
        const value = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return next(new ApiError(400, `${paramName} is invalid`));
        }
        next();
    };
};

export const validateRoleUpdate = (req, res, next) => {
    const { role } = req.body;
    const normalized = normalizeRole(role);

    if (!normalized || !["candidate", "recruiter", "admin"].includes(normalized)) {
        return next(new ApiError(400, "Valid role is required"));
    }
    next();
};

