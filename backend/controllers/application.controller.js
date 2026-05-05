import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";

const canManageApplication = (job, user) =>
    user?.role === "admin" || String(job.created_by) === String(user?.id);

export const applyJob = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const userRole = req.user?.role;
    const jobId = req.params.id || req.params.jobId;

    // Only candidates can apply
    if (userRole !== "candidate") {
        throw new ApiError(403, "Only candidates can apply for jobs");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.isActive === false) {
        throw new ApiError(400, "This job is no longer accepting applications");
    }

    const existingApplication = await Application.findOne({
        job: jobId,
        applicant: userId,
    });
    if (existingApplication) {
        throw new ApiError(400, "You have already applied for this job");
    }

    const userResume = await Resume.findOne({ userId });

    const application = await Application.create({
        job: jobId,
        applicant: userId,
        status: "applied",
        resumeId: userResume ? userResume._id : null,
        atsScore: 0 // Will be calculated later
    });

    job.applications = [...new Set([...(job.applications || []), application._id])];
    await job.save();

    return sendSuccess(
        res,
        201,
        {
            application,
        },
        "Job applied successfully",
        { application }
    );
});

export const getAppliedJobs = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { page, limit, skip } = getPagination(req.query);

    const query = { applicant: userId };
    const totalApplications = await Application.countDocuments(query);

    const application = await Application.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: "job",
            populate: {
                path: "company",
            },
        });

    return sendSuccess(
        res,
        200,
        {
            application,
            pagination: buildPaginationMeta(totalApplications, page, limit),
        },
        "Applied jobs fetched successfully",
        { application }
    );
});

export const getApplicants = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const { page, limit, skip } = getPagination(req.query);

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (!canManageApplication(job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    const totalApplications = await Application.countDocuments({ job: jobId });

    const applications = await Application.find({ job: jobId })
        .sort({ atsScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: "applicant",
            select: "_id fullname email profile.phoneNumber profile.bio profile.skills profile.resume profile.profilePhoto",
        });

    return sendSuccess(
        res,
        200,
        {
            job: {
                _id: job._id,
                title: job.title,
                company: job.company,
            },
            applications,
            pagination: buildPaginationMeta(totalApplications, page, limit),
        },
        "Applicants fetched successfully",
        { applications }
    );
});

export const updateStatus = asyncHandler(async (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;

    const application = await Application.findById(applicationId).populate({
        path: "job",
    });

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (!application.job) {
        throw new ApiError(404, "Job not found");
    }

    if (!canManageApplication(application.job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    const normalizedStatus = String(status).toLowerCase();
    const validStatuses = ["applied", "shortlisted", "rejected"];
    if (!validStatuses.includes(normalizedStatus)) {
        throw new ApiError(400, "Invalid status value. Must be applied, shortlisted, or rejected");
    }

    // Enforce status transition rules:
    // applied → shortlisted → rejected (no reverse)
    const currentStatus = application.status;
    const transitions = {
        applied: ["shortlisted", "rejected"],
        shortlisted: ["rejected"],
        rejected: [],
    };

    if (currentStatus === normalizedStatus) {
        throw new ApiError(400, `Application is already ${currentStatus}`);
    }

    if (!transitions[currentStatus]?.includes(normalizedStatus)) {
        throw new ApiError(400, `Cannot transition from ${currentStatus} to ${normalizedStatus}`);
    }

    application.status = normalizedStatus;
    await application.save();

    return sendSuccess(
        res,
        200,
        {
            application,
        },
        "Status updated successfully",
        { application }
    );
});

