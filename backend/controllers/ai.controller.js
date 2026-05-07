import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { Resume } from "../models/resume.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";

// Deterministic resume analysis endpoint used by frontend:
// GET /api/ai/resume-analysis
export const getResumeAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 }).lean();

    if (!analysis) {
      // Fallback to check if it's stored in Resume collection instead
      const resumeDoc = await Resume.findOne({ userId: req.user.id }).lean();
      
      if (resumeDoc?.parsedData?.analysis) {
        const fallback = resumeDoc.parsedData.analysis;
        return res.status(200).json({
          success: true,
          analysis: {
            atsScore: fallback.atsScore || 0,
            predictedRole: fallback.predictedRole || "",
            skills: fallback.skills || [],
            strengths: fallback.strengths || [],
            weaknesses: fallback.weaknesses || [],
            recommendations: fallback.recommendations || []
          }
        });
      }

      return res.status(404).json({
        success: false,
        message: "No deterministic resume analysis found",
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Resume analysis fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume analysis",
    });
  }
};

