import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { aiAnalyzeResume } from "../services/resumeAnalysis.service.js";
import { Resume } from "../models/resume.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const extractPdfText = async (resumeFileUrlOrPath) => {
    let buffer;

    // Allow Cloudinary/http URLs (already used in this app for resume storage)
    if (typeof resumeFileUrlOrPath === "string" && resumeFileUrlOrPath.startsWith("http")) {
        const fileResponse = await fetch(resumeFileUrlOrPath);
        if (!fileResponse.ok) {
            throw new ApiError(400, `Failed to fetch resume file: ${fileResponse.statusText}`);
        }
        const arrayBuffer = await fileResponse.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    } else {
        const filePath = path.resolve(resumeFileUrlOrPath);
        if (!fs.existsSync(filePath)) {
            throw new ApiError(404, "Local resume file not found");
        }
        buffer = fs.readFileSync(filePath);
    }

    const parsed = await pdf(buffer);
    const text = parsed?.text || "";

    if (!text || !text.trim()) {
        throw new ApiError(400, "Could not extract any text from the PDF. It might be corrupt or empty.");
    }

    return text;
};

// Deterministic resume analysis (Flask ML ATS)
export const parseResume = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const resume = await Resume.findOne({ userId });
    if (!resume) {
        throw new ApiError(404, "No resume found. Please upload a resume first.");
    }

    if (!resume.fileUrl) {
        throw new ApiError(400, "No resume file URL/path found for this user.");
    }

    // If deterministic analysis is already persisted, return it.
    // We intentionally do NOT use any LLM-parsed structure anymore.
    if (resume.parsedData?.analysis) {
        return sendSuccess(res, 200, resume.parsedData, "Resume analysis already computed");
    }

    const resumeText = await extractPdfText(resume.fileUrl);
    const ml = await aiAnalyzeResume(resumeText);

    const deterministicAnalysis = {
        atsScore: ml?.atsScore ?? 0,
        predictedRole: ml?.predictedRole ?? "",
        skills: Array.isArray(ml?.skills) ? ml.skills : [],
        strengths: Array.isArray(ml?.strengths) ? ml.strengths : [],
        weaknesses: Array.isArray(ml?.weaknesses) ? ml.weaknesses : [],
        recommendations: Array.isArray(ml?.recommendations) ? ml.recommendations : [],
    };

    // Persist deterministic analysis to MongoDB.
    // Existing schema stores this under Resume.parsedData.
    const persisted = { success: true, analysis: deterministicAnalysis };
    resume.parsedData = persisted;
    await resume.save();
    
    // Also store it in ResumeAnalysis so ai.controller.js can fetch it deterministically
    await ResumeAnalysis.create({
        userId,
        atsScore: deterministicAnalysis.atsScore,
        predictedRole: deterministicAnalysis.predictedRole,
        skills: deterministicAnalysis.skills,
        strengths: deterministicAnalysis.strengths,
        weaknesses: deterministicAnalysis.weaknesses,
        recommendations: deterministicAnalysis.recommendations,
        analyzedAt: new Date()
    });

    return sendSuccess(res, 200, persisted, "Resume analyzed successfully (deterministic ML)");
});

