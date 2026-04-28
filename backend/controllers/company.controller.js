import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { logger } from "../utils/logger.js";

const canManageCompany = (company, user) =>
    user?.role === "admin" || String(company.createdBy) === String(user?.id);

export const registerCompany = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const userRole = req.user?.role;
    const { name, description, website, location } = req.body;

    if (userRole !== "recruiter" && userRole !== "admin") {
        throw new ApiError(403, "Only recruiters can register companies");
    }

    const normalizedName = String(name || "").trim();

    if (!normalizedName) {
        throw new ApiError(400, "Company name is required");
    }

    const existingCompany = await Company.findOne({
        name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingCompany) {
        throw new ApiError(409, "Company already exists");
    }

    const company = await Company.create({
        name: normalizedName,
        description: description ? String(description).trim() : undefined,
        website: website ? String(website).trim() : undefined,
        location: location ? String(location).trim() : undefined,
        createdBy: userId,
    });

    return sendSuccess(res, 201, { company }, "Company created successfully");
});

export const getCompany = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const companies = await Company.find({ createdBy: userId }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, { companies }, "Companies fetched successfully");
});

export const getCompanyById = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    if (!canManageCompany(company, req.user)) {
        throw new ApiError(403, "You do not have permission to access this company");
    }

    return sendSuccess(res, 200, { company }, "Company fetched successfully");
});

export const updateCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    if (!canManageCompany(company, req.user)) {
        throw new ApiError(403, "You do not have permission to update this company");
    }

    const { name, description, website, location } = req.body;

    if (name !== undefined) {
        const normalized = String(name).trim();
        if (!normalized) {
            throw new ApiError(400, "Company name cannot be empty");
        }
        if (normalized.toLowerCase() !== company.name.toLowerCase()) {
            const existing = await Company.findOne({
                name: { $regex: new RegExp(`^${normalized}$`, "i") },
            });
            if (existing) {
                throw new ApiError(409, "Company name is already in use");
            }
        }
        company.name = normalized;
    }

    if (description !== undefined) company.description = String(description).trim();
    if (website !== undefined) company.website = String(website).trim();
    if (location !== undefined) company.location = String(location).trim();

    const fileDataUri = req.file ? getDataUri(req.file) : null;
    if (fileDataUri?.content) {
        const isImage = /^image\//.test(req.file.mimetype);
        if (!isImage) {
            throw new ApiError(400, "Only image files are allowed for company logo");
        }
        const cloudResponse = await cloudinary.uploader.upload(fileDataUri.content);
        company.logo = cloudResponse.secure_url;
    }

    await company.save();

    return sendSuccess(res, 200, { company }, "Company updated successfully");
});

