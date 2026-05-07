import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { Application } from "../models/application.model.js";

// Deterministic ATS scoring integration.
//
// This project now persists ATS scores deterministically via the Flask ML service,
// during resume upload (see resume.controller.js).
//
// This controller endpoint is kept for backward compatibility with routes.
// It updates an existing Application. No LLM/Groq/OpenAI calls are performed here.

export const calculateATS = asyncHandler(async (req, res) => {
    const { applicationId, atsScore } = req.body;

    if (!applicationId) {
        throw new ApiError(400, "applicationId is required");
    }
    if (atsScore === undefined || atsScore === null) {
        throw new ApiError(400, "atsScore is required" );
    }

    const normalized = Number(atsScore);
    if (!Number.isFinite(normalized)) {
        throw new ApiError(400, "atsScore must be a number");
    }

    const application = await Application.findByIdAndUpdate(
        applicationId,
        { atsScore: Math.max(0, Math.min(100, normalized)) },
        { new: true }
    );

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    return sendSuccess(res, 200, { application }, "ATS score updated successfully");
});

