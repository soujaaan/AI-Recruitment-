import { InterviewSchedule } from "../models/interviewSchedule.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

const canManageJob = (job, user) =>
    user?.role === "admin" || String(job.created_by) === String(user?.id);

export const scheduleInterview = asyncHandler(async (req, res) => {
    const recruiterId = req.user?.id || req.id;
    const { candidateId, jobId, applicationId, scheduledAt, meetingLink, notes } = req.body;

    if (!candidateId || !jobId || !scheduledAt) {
        throw new ApiError(400, "candidateId, jobId, and scheduledAt are required");
    }

    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, "Job not found");
    if (!canManageJob(job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) throw new ApiError(404, "Candidate not found");

    const application = applicationId
        ? await Application.findById(applicationId)
        : await Application.findOne({ job: jobId, applicant: candidateId });

    if (!application) {
        throw new ApiError(400, "Candidate has not applied to this job");
    }

    const link = meetingLink || req.body.meetLink || "";
    const schedule = await InterviewSchedule.create({
        applicationId: application._id,
        application: application._id,
        candidate: candidateId,
        candidateId,
        recruiter: recruiterId,
        recruiterId,
        companyId: job.companyId,
        job: jobId,
        jobId,
        roundType: req.body.roundType || "Technical",
        scheduledAt: new Date(scheduledAt),
        meetingLink: link,
        meetLink: link,
        durationMinutes: req.body.durationMinutes || 45,
        timezone: req.body.timezone || "UTC",
        interviewerDetails: req.body.interviewerDetails || {},
        notes: notes || "",
        status: "scheduled",
    });

    application.status = "interview scheduled";
    application.applicationStatus = "interview scheduled";
    application.timeline = [
        ...(application.timeline || []),
        { stage: "Interview Scheduled", timestamp: new Date(), note: notes || "" },
    ];
    await application.save();

    return sendSuccess(res, 201, { schedule }, "Interview scheduled successfully");
});

export const getMyInterviews = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;

    const schedules = await InterviewSchedule.find({ candidate: userId })
        .sort({ scheduledAt: 1 })
        .populate("job", "title company location")
        .populate("recruiter", "fullname email")
        .lean();

    return sendSuccess(res, 200, { schedules }, "Interviews fetched successfully");
});

export const getJobInterviews = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, "Job not found");
    if (!canManageJob(job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    const schedules = await InterviewSchedule.find({ job: jobId })
        .sort({ scheduledAt: 1 })
        .populate("candidate", "fullname email profile.profilePhoto")
        .lean();

    return sendSuccess(res, 200, { schedules }, "Job interviews fetched successfully");
});
