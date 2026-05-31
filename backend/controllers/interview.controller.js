import mongoose from "mongoose";
import { InterviewSchedule } from "../models/interviewSchedule.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { notificationService } from "../services/notification.service.js";

const getMeetingAccessState = (schedule, now = new Date()) => {
    const start = new Date(schedule.scheduledAt);
    const durationMinutes = schedule.durationMinutes || 45;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const windowStart = new Date(start.getTime() - 60 * 60 * 1000);

    if (now < windowStart) {
        return "locked";
    }
    if (now >= windowStart && now <= end) {
        return "active";
    }
    return "expired";
};

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

    // Trigger Notification to Candidate
    try {
        await notificationService.createNotification({
            recipient: candidateId,
            type: "INTERVIEW_SCHEDULED",
            title: "Interview Scheduled",
            message: "Your interview has been scheduled.",
            entityType: "InterviewSchedule",
            entityId: schedule._id,
            priority: "high",
            metadata: {
                jobId: job._id,
                jobTitle: job.title,
                scheduledAt: schedule.scheduledAt,
                roundType: schedule.roundType,
                meetingLink: schedule.meetingLink || schedule.meetLink || ""
            }
        });
    } catch (notificationError) {
        console.error("Failed to trigger interview schedule notification:", notificationError);
    }

    return sendSuccess(res, 201, { schedule }, "Interview scheduled successfully");
});

export const getMyInterviews = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;

    const schedules = await InterviewSchedule.find({ candidate: userId })
        .sort({ scheduledAt: 1 })
        .populate("job", "title company location")
        .populate("recruiter", "fullname email")
        .lean();

    const now = new Date();
    const enhanced = schedules.map((s) => {
        const accessState = getMeetingAccessState(s, now);
        return {
            ...s,
            meetingAccess: {
                state: accessState,
                startsAt: s.scheduledAt,
                durationMinutes: s.durationMinutes || 45,
            },
        };
    });

    return sendSuccess(res, 200, { schedules: enhanced }, "Interviews fetched successfully");
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

    const now = new Date();
    const enhanced = schedules.map((s) => {
        const accessState = getMeetingAccessState(s, now);
        return {
            ...s,
            meetingAccess: {
                state: accessState,
                startsAt: s.scheduledAt,
                durationMinutes: s.durationMinutes || 45,
            },
        };
    });

    return sendSuccess(res, 200, { schedules: enhanced }, "Job interviews fetched successfully");
});

export const getMeetingLink = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { id } = req.params;

    const schedule = await InterviewSchedule.findById(id).lean();
    if (!schedule) {
        throw new ApiError(404, "Interview not found");
    }

    const isCandidate = String(schedule.candidateId || schedule.candidate) === String(userId);
    const isRecruiter = String(schedule.recruiterId || schedule.recruiter) === String(userId);

    if (!isCandidate && !isRecruiter) {
        throw new ApiError(403, "You are not allowed to access this meeting");
    }

    const accessState = getMeetingAccessState(schedule, new Date());

    if (accessState === "locked") {
        throw new ApiError(403, "Meeting is not yet open. Join is available 1 hour before start time.");
    }

    if (accessState === "expired") {
        throw new ApiError(403, "Meeting has ended. Access is no longer available.");
    }

    const meetingLink = schedule.meetingLink || schedule.meetLink || "";
    if (!meetingLink) {
        throw new ApiError(400, "No meeting link configured for this interview");
    }

    return sendSuccess(
        res,
        200,
        { meetingLink },
        "Meeting link fetched successfully"
    );
});

export const updateInterview = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { id } = req.params;
    const { scheduledAt, meetingLink, notes, roundType, durationMinutes, timezone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Interview ID format");
    }

    const schedule = await InterviewSchedule.findById(id).populate("job");
    if (!schedule) {
        throw new ApiError(404, "Interview not found");
    }

    if (!canManageJob(schedule.job, req.user)) {
        throw new ApiError(403, "You do not own the job associated with this interview");
    }

    if (scheduledAt) schedule.scheduledAt = new Date(scheduledAt);
    if (meetingLink !== undefined) {
        schedule.meetingLink = meetingLink;
        schedule.meetLink = meetingLink;
    }
    if (notes !== undefined) schedule.notes = notes;
    if (roundType !== undefined) schedule.roundType = roundType;
    if (durationMinutes !== undefined) schedule.durationMinutes = durationMinutes;
    if (timezone !== undefined) schedule.timezone = timezone;
    schedule.status = "rescheduled";

    await schedule.save();

    // Trigger Notification to Candidate
    try {
        await notificationService.createNotification({
            recipient: schedule.candidateId || schedule.candidate,
            type: "INTERVIEW_UPDATED",
            title: "Interview Updated",
            message: "Interview details have been updated.",
            entityType: "InterviewSchedule",
            entityId: schedule._id,
            priority: "high",
            metadata: {
                jobId: schedule.jobId || schedule.job?._id,
                jobTitle: schedule.job?.title || "your job application",
                scheduledAt: schedule.scheduledAt,
                roundType: schedule.roundType,
                meetingLink: schedule.meetingLink || schedule.meetLink || ""
            }
        });
    } catch (notificationError) {
        console.error("Failed to trigger interview update notification:", notificationError);
    }

    return sendSuccess(res, 200, { schedule }, "Interview updated successfully");
});

export const cancelInterview = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Interview ID format");
    }

    const schedule = await InterviewSchedule.findById(id).populate("job");
    if (!schedule) {
        throw new ApiError(404, "Interview not found");
    }

    if (!canManageJob(schedule.job, req.user)) {
        throw new ApiError(403, "You do not own the job associated with this interview");
    }

    schedule.status = "cancelled";
    await schedule.save();

    // Also update corresponding application timeline/status if needed
    const application = await Application.findById(schedule.applicationId);
    if (application) {
        application.timeline = [
            ...(application.timeline || []),
            { stage: "Interview Cancelled", timestamp: new Date() },
        ];
        await application.save();
    }

    // Trigger Notification to Candidate
    try {
        await notificationService.createNotification({
            recipient: schedule.candidateId || schedule.candidate,
            type: "INTERVIEW_CANCELLED",
            title: "Interview Cancelled",
            message: "Interview has been cancelled.",
            entityType: "InterviewSchedule",
            entityId: schedule._id,
            priority: "high",
            metadata: {
                jobId: schedule.jobId || schedule.job?._id,
                jobTitle: schedule.job?.title || "your job application",
                roundType: schedule.roundType
            }
        });
    } catch (notificationError) {
        console.error("Failed to trigger interview cancel notification:", notificationError);
    }

    return sendSuccess(res, 200, { schedule }, "Interview cancelled successfully");
});
