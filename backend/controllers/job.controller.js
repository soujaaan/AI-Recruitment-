import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { logger } from "../utils/logger.js";
import {
    attachApplicantCountsToJobs,
    buildRecruiterJobsQuery,
    countApplicationsForJobs,
    getApplicantCountsByJobIds,
    getRecruiterDashboardMetrics,
    jobApplicationMatch,
} from "../utils/jobApplicantCounts.js";
import { buildPublicJobQuery, getJobFilterOptions } from "../utils/jobFilters.util.js";
import {
    buildCandidateContext,
    MAX_JOBS_FOR_SCORING,
    rankJobsForCandidate,
} from "../utils/jobRecommendation.util.js";
import { ROLES } from "../constants/roles.js";

const canManageJob = (job, user) =>
    user?.role === "admin" ||
    String(job.created_by) === String(user?.id) ||
    String(job.recruiterId) === String(user?.id);

export const postJob = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const userRole = req.user?.role;
    const {
        title,
        description,
        requirements,
        salaryRange,
        location,
        jobType,
        experienceLevel,
        openings,
        company,
    } = req.body;

    if (userRole !== "recruiter" && userRole !== "admin") {
        throw new ApiError(403, "Only recruiters or admins can post jobs");
    }

    // Use company object from request
    const job = await Job.create({
        title,
        description,
        requirements,
        salary: salaryRange,
        location,
        jobType,
        experienceLevel,
        position: openings,
        company: {
            name: company?.name || "Unknown Company",
            website: company?.website || "",
            location: company?.location || "",
            logo: ""
        },
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

export const getJobFilters = asyncHandler(async (req, res) => {
    const filters = await getJobFilterOptions();
    return sendSuccess(res, 200, { filters }, "Job filters fetched successfully", { filters });
});

export const getAllJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { query, searchTerm } = buildPublicJobQuery(req.query);

    const userRole = req.user?.role;
    const isCandidate = userRole === ROLES.CANDIDATE || userRole === "candidate";

    let feedType = "latest";
    let candidateContext = null;

    if (isCandidate && req.user?.id) {
        candidateContext = await buildCandidateContext(req.user.id);
        feedType = "personalized";
    } else if (userRole === ROLES.RECRUITER || userRole === ROLES.ADMIN) {
        feedType = "latest";
    }

    if (isCandidate && candidateContext) {
        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .limit(MAX_JOBS_FOR_SCORING)
            .lean();

        const rankedJobs = rankJobsForCandidate(jobs, candidateContext);
        const totalJobs = rankedJobs.length;
        const paginatedJobs = rankedJobs.slice(skip, skip + limit);

        return sendSuccess(
            res,
            200,
            {
                jobs: paginatedJobs,
                pagination: buildPaginationMeta(totalJobs, page, limit),
                feedType,
                personalized: true,
            },
            "Personalized jobs fetched successfully",
            { jobs: paginatedJobs, feedType }
        );
    }

    const totalJobs = await Job.countDocuments(query);
    const jobsQuery = Job.find(
        query,
        searchTerm ? { score: { $meta: "textScore" } } : {}
    )
        .skip(skip)
        .limit(limit);

    if (searchTerm) {
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
            feedType,
            personalized: false,
        },
        "Jobs fetched successfully",
        { jobs, feedType }
    );
});

export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    const applicantCount = await countApplicationsForJobs([job._id]);
    const jobWithCount = {
        ...(job.toObject ? job.toObject() : job),
        applicantCount,
    };

    return sendSuccess(res, 200, { job: jobWithCount }, "Job fetched successfully", { job: jobWithCount });
});

export const getAdminJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const query = buildRecruiterJobsQuery(req.user);

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const jobIds = jobs.map((j) => j._id);
    const [countMap, metrics] = await Promise.all([
        getApplicantCountsByJobIds(jobIds),
        getRecruiterDashboardMetrics(jobIds),
    ]);

    const jobsWithCounts = attachApplicantCountsToJobs(jobs, countMap);

    return sendSuccess(
        res,
        200,
        {
            jobs: jobsWithCounts,
            metrics,
            pagination: buildPaginationMeta(totalJobs, page, limit),
        },
        "Admin jobs fetched successfully",
        { jobs: jobsWithCounts, metrics }
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
        salaryRange,
        location,
        jobType,
        experienceLevel,
        openings,
        company,
        isActive,
    } = req.body;

    if (company !== undefined) {
        if (company.name !== undefined) {
            job.company.name = company.name;
        }
        if (company.website !== undefined) {
            job.company.website = company.website;
        }
        if (company.location !== undefined) {
            job.company.location = company.location;
        }
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
    if (salaryRange !== undefined) {
        job.salary = salaryRange;
    }
    if (location !== undefined) {
        const trimmed = String(location).trim();
        if (trimmed.length === 0) throw new ApiError(400, "Location cannot be empty");
        job.location = trimmed;
    }
    if (jobType !== undefined) {
        job.jobType = jobType;
    }
    if (experienceLevel !== undefined) {
        job.experienceLevel = experienceLevel;
    }
    if (openings !== undefined) {
        const num = Number(openings);
        if (!Number.isFinite(num) || num <= 0) throw new ApiError(400, "Invalid openings count");
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

    await Application.deleteMany(jobApplicationMatch([job._id]));

    await Job.findByIdAndDelete(job._id);

    logger.info(`Job deleted: ${job._id} (${job.title})`);

    return sendSuccess(
        res,
        200,
        { jobId: job._id },
        "Job deleted successfully"
    );
});

