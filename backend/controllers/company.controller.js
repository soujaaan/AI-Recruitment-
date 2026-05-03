import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const registerCompany = asyncHandler(async (req, res) => {
    const { companyName } = req.body;
    if (!companyName) {
        throw new ApiError(400, "Company name is required");
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
        throw new ApiError(400, "You can't register same company");
    }

    const companyData = {
        name: companyName,
        userId: req.user?.id || req.id
    };

    const file = req.file;
    if (file) {
        const fileUri = getDataUri(file);
        
        // Check size limit (max 5MB)
        const maxSizeBytes = (env.uploadMaxSizeMb || 5) * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            throw new ApiError(400, `File size exceeds ${env.uploadMaxSizeMb || 5}MB limit`);
        }

        const isImageFile = /^image\//.test(file.mimetype);
        if (!isImageFile) {
            throw new ApiError(400, "Only image files are allowed for company logo");
        }

        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        companyData.logo = cloudResponse.secure_url;
    }

    company = await Company.create(companyData);

    return sendSuccess(res, 201, { company }, "Company registered successfully", { company });
});

export const getCompany = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const companies = await Company.find({ userId });
    
    if (!companies) {
        throw new ApiError(404, "Companies not found");
    }

    return sendSuccess(res, 200, { companies }, "Companies fetched successfully", { companies });
});

export const getCompanyById = asyncHandler(async (req, res) => {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return sendSuccess(res, 200, { company }, "Company fetched successfully", { company });
});

export const updateCompany = asyncHandler(async (req, res) => {
    const { name, description, website, location } = req.body;
    
    const file = req.file;
    // cloudinary logic here
    const updateData = { name, description, website, location };
    
    if (file) {
        const fileUri = getDataUri(file);
        
        // Check size limit (max 5MB)
        const maxSizeBytes = (env.uploadMaxSizeMb || 5) * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            throw new ApiError(400, `File size exceeds ${env.uploadMaxSizeMb || 5}MB limit`);
        }

        const isImageFile = /^image\//.test(file.mimetype);
        if (!isImageFile) {
            throw new ApiError(400, "Only image files are allowed for company logo");
        }

        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        updateData.logo = cloudResponse.secure_url;
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return sendSuccess(res, 200, { company }, "Company information updated successfully", { company });
});
