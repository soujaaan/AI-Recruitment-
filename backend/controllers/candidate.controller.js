import { User } from "../models/user.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { Application } from "../models/application.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { AIInterviewLog } from "../models/aiInterviewLog.model.js";
import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const getCandidateProfile = asyncHandler(async (req, res) => {
    const candidateId = req.params.candidateId;
    const recruiterId = req.user?.id || req.id;

    const recruiterJobs = await Job.find({
        $or: [{ created_by: recruiterId }, { recruiterId }],
    }).select("_id");

    const recruiterJobIds = new Set(recruiterJobs.map((job) => job._id.toString()));

    const candidateApplications = await Application.find({
        $or: [{ applicant: candidateId }, { candidateId }],
    }).select("job jobId");

    const hasApplication = candidateApplications.some((app) =>
        recruiterJobIds.has(String(app.jobId || app.job))
    );

    if (!hasApplication && req.user?.role !== "admin") {
        throw new ApiError(403, "Unauthorized recruiter access");
    }

    const applications = await Application.find({ applicant: candidateId }).populate("job");

    const user = await User.findById(candidateId).select("-password");
    if (!user) {
        throw new ApiError(404, "Candidate not found");
    }

    const detailedProfile = await CandidateProfile.findOne({ userId: candidateId });

    const resumeAnalysis = await ResumeAnalysis.findOne({ userId: candidateId }).sort({ createdAt: -1 });

    const interviewLogs = await AIInterviewLog.find({ candidateId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    const relevantApplication = applications.find(app => 
        app.job?.created_by?.toString() === recruiterId.toString() ||
        app.job?.recruiterId?.toString() === recruiterId.toString()
    );

    const matchPercentage = relevantApplication?.matchScore ?? 0;
    const atsPercentage = relevantApplication?.atsScore ?? resumeAnalysis?.atsScore ?? 0;
    const aiRanking = relevantApplication?.aiRanking || (matchPercentage > 80 ? "Highly Recommended" : matchPercentage > 60 ? "Recommended" : "Average Fit");
    
    const candidateData = {
        basicInfo: {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            ...user.profile,
            profilePhoto: user.profile?.profilePhoto || ""
        },
        detailedProfile: detailedProfile || null,
        resumeAnalysis: resumeAnalysis || null,
        interviewLogs: interviewLogs || [],
        applications: applications.map(app => ({
            _id: app._id,
            jobId: app.job?._id,
            jobTitle: app.job?.title,
            company: app.job?.company?.name,
            status: app.status,
            appliedAt: app.createdAt,
            atsScore: app.atsScore,
            matchScore: app.matchScore,
            matchedSkills: app.matchedSkills,
            missingSkills: app.missingSkills,
            aiRanking: app.aiRanking
        })),
        recruiterAnalytics: {
            matchPercentage,
            atsPercentage,
            matchedSkills: relevantApplication?.matchedSkills || [],
            missingSkills: relevantApplication?.missingSkills || [],
            resumeUrl: detailedProfile?.resumePdfUrl || user.profile?.resume || "",
            aiRanking,
            hiringRecommendation: resumeAnalysis?.recommendations?.[0] || "Evaluate based on interview.",
            relevantApplicationId: relevantApplication?._id,
            relevantJobId: relevantApplication?.job?._id,
            recruiterId: recruiterId
        }
    };

    return sendSuccess(res, 200, candidateData, "Candidate profile fetched successfully");
});
