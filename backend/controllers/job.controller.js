import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { logger } from "../utils/logger.js";

const canManageJob = (job, user) =>
    user?.role === "admin" || String(job.created_by) === String(user?.id);

const ensureCompanyOwnership = async (companyId, user) => {
    if (!companyId) {
        throw new ApiError(400, "Company ID is required");
    }

    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    if (user?.role !== "admin" && String(company.createdBy) !== String(user?.id)) {
        throw new ApiError(403, "You do not own this company");
    }

    return company;
};

export const postJob = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const userRole = req.user?.role;
    const {
        title,
        description,
        requirements,
        salary,
        location,
        jobType,
        experience,
        position,
        companyId,
    } = req.body;

    if (userRole !== "recruiter" && userRole !== "admin") {
        throw new ApiError(403, "Only recruiters or admins can post jobs");
    }

    await ensureCompanyOwnership(companyId, req.user);

    const job = await Job.create({
        title,
        description,
        requirements,
        salary,
        location,
        jobType,
        experienceLevel: experience,
        position,
        company: companyId,
        created_by: userId,
        isActive: true,
    });

    return sendSuccess(
        res,
        201,
        {
            job,
        },
        "New job created successfully",
        { job }
    );
});

export const getAllJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const search = String(req.query.search || req.query.keyword || "").trim();

    if (search && search.length < 3) {
        throw new ApiError(400, "Search query must be at least 3 characters");
    }

    const query = search ? { $text: { $search: search } } : {};

    const totalJobs = await Job.countDocuments(query);
    const jobsQuery = Job.find(
        query,
        search ? { score: { $meta: "textScore" } } : {}
    )
        .populate({ path: "company" })
        .skip(skip)
        .limit(limit);

    if (search) {
        jobsQuery.sort({ score: { $meta: "textScore" } });
    } else {
        jobsQuery.sort({ createdAt: -1 });
    }

    const jobs = await jobsQuery;

    return sendSuccess(
        res,
        200,
        {
            jobs,
            pagination: buildPaginationMeta(totalJobs, page, limit),
        },
        "Jobs fetched successfully",
        { jobs }
    );
});

export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate({
        path: "company",
    });

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return sendSuccess(res, 200, { job }, "Job fetched successfully", { job });
});

export const getAdminJobs = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { page, limit, skip } = getPagination(req.query);
    const query =
        req.user?.role === "admin" ? {} : { created_by: userId };

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
        .populate({ path: "company" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return sendSuccess(
        res,
        200,
        {
            jobs,
            pagination: buildPaginationMeta(totalJobs, page, limit),
        },
        "Admin jobs fetched successfully",
        { jobs }
    );
});

export const updateJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (!canManageJob(job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    const {
        title,
        description,
        requirements,
        salary,
        location,
        jobType,
        experience,
        position,
        companyId,
        isActive,
    } = req.body;

    if (companyId) {
        await ensureCompanyOwnership(companyId, req.user);
        job.company = companyId;
    }

    if (title !== undefined) {
        const trimmed = String(title).trim();
        if (trimmed.length === 0) throw new ApiError(400, "Title cannot be empty");
        job.title = trimmed;
    }
    if (description !== undefined) {
        const trimmed = String(description).trim();
        if (trimmed.length === 0) throw new ApiError(400, "Description cannot be empty");
        job.description = trimmed;
    }
    if (requirements !== undefined) {
        job.requirements = Array.isArray(requirements)
            ? requirements.map((r) => String(r).trim()).filter(Boolean)
            : String(requirements).split(",").map((r) => r.trim()).filter(Boolean);
    }
    if (salary !== undefined) {
        const num = Number(salary);
        if (!Number.isFinite(num) || num <= 0) throw new ApiError(400, "Invalid salary");
        job.salary = num;
    }
    if (location !== undefined) {
        const trimmed = String(location).trim();
        if (trimmed.length === 0) throw new ApiError(400, "Location cannot be empty");
        job.location = trimmed;
    }
    if (jobType !== undefined) {
        const trimmed = String(jobType).trim();
        if (trimmed.length === 0) throw new ApiError(400, "Job type cannot be empty");
        job.jobType = trimmed;
    }
    if (experience !== undefined) {
        const num = Number(experience);
        if (!Number.isFinite(num) || num < 0) throw new ApiError(400, "Invalid experience");
        job.experienceLevel = num;
    }
    if (position !== undefined) {
        const num = Number(position);
        if (!Number.isFinite(num) || num <= 0) throw new ApiError(400, "Invalid position count");
        job.position = num;
    }
    if (isActive !== undefined) {
        job.isActive = Boolean(isActive);
    }

    await job.save();

    return sendSuccess(res, 200, { job }, "Job updated successfully", { job });
});

export const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (!canManageJob(job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    // Cascade delete related applications
    await Application.deleteMany({ job: job._id });

    await Job.findByIdAndDelete(job._id);

    logger.info(`Job deleted: ${job._id} (${job.title})`);

    return sendSuccess(
        res,
        200,
        { jobId: job._id },
        "Job deleted successfully"
    );
});

