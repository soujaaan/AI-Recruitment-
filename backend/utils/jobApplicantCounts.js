import mongoose from "mongoose";
import { Application } from "../models/application.model.js";

/** Jobs owned by a recruiter (uses the canonical created_by schema field strictly). */
export const buildRecruiterJobsQuery = (user) => {
    if (user?.role === "admin") return {};
    const userId = user?.id || user?._id;
    return {
        created_by: userId,
    };
};

const toObjectId = (id) =>
    id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);

/** Match applications for one or more jobs using the canonical jobId field. */
export const jobApplicationMatch = (jobIds) => {
    const ids = (Array.isArray(jobIds) ? jobIds : [jobIds])
        .filter(Boolean)
        .map(toObjectId);

    if (!ids.length) return { _id: null };

    if (ids.length === 1) {
        return { jobId: ids[0] };
    }

    return {
        jobId: { $in: ids },
    };
};

export const countApplicationsForJobs = async (jobIds) => {
    if (!jobIds?.length) return 0;
    return Application.countDocuments(jobApplicationMatch(jobIds));
};

/** Returns Map<jobIdString, count> */
export const getApplicantCountsByJobIds = async (jobIds) => {
    const map = new Map();
    if (!jobIds?.length) return map;

    const rows = await Application.aggregate([
        { $match: jobApplicationMatch(jobIds) },
        {
            $group: {
                _id: { $ifNull: ["$jobId", "$job"] },
                count: { $sum: 1 },
            },
        },
    ]);

    for (const row of rows) {
        if (row._id) map.set(String(row._id), row.count);
    }
    return map;
};

export const attachApplicantCountsToJobs = (jobs, countMap) =>
    jobs.map((job) => {
        const doc = job?.toObject ? job.toObject() : { ...job };
        return {
            ...doc,
            applicantCount: countMap.get(String(doc._id)) ?? 0,
        };
    });

export const getRecruiterDashboardMetrics = async (jobIds) => {
    if (!jobIds?.length) {
        return {
            totalApplicants: 0,
            shortlisted: 0,
            interviewsScheduled: 0,
            hired: 0,
            rejected: 0,
        };
    }

    const baseMatch = jobApplicationMatch(jobIds);

    const [totalApplicants, statusCounts] = await Promise.all([
        Application.countDocuments(baseMatch),
        Application.aggregate([
            { $match: baseMatch },
            {
                $group: {
                    _id: { $ifNull: ["$applicationStatus", "$status"] },
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);

    const countFor = (status) =>
        statusCounts.find((s) => s._id === status)?.count ?? 0;

    return {
        totalApplicants,
        shortlisted: countFor("shortlisted"),
        interviewsScheduled: countFor("interview scheduled"),
        hired: countFor("hired"),
        rejected: countFor("rejected"),
    };
};
