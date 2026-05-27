import { Job } from "../models/job.model.js";

const sortAlpha = (arr) => [...arr].sort((a, b) => String(a).localeCompare(String(b)));

const cleanValues = (values = []) =>
    sortAlpha(
        [...new Set(values.map((v) => String(v).trim()).filter(Boolean))]
    );

export const buildPublicJobQuery = (filters = {}) => {
    const query = { isActive: { $ne: false }, isFlagged: { $ne: true } };

    const searchTerm = String(filters.search || filters.keyword || "").trim();
    if (searchTerm) {
        query.$text = { $search: searchTerm };
    }

    if (filters.location && filters.location !== "All") {
        query.location = String(filters.location).trim();
    }

    if (filters.jobType && filters.jobType !== "All") {
        query.jobType = String(filters.jobType).trim();
    }

    if (filters.salary && filters.salary !== "All") {
        query.salary = String(filters.salary).trim();
    }

    if (filters.experienceLevel && filters.experienceLevel !== "All") {
        query.experienceLevel = String(filters.experienceLevel).trim();
    }

    if (filters.category && filters.category !== "All") {
        query["aiMetadata.category"] = String(filters.category).trim();
    }

    return { query, searchTerm };
};

export const getJobFilterOptions = async () => {
    const matchStage = { isActive: { $ne: false }, isFlagged: { $ne: true } };

    const [aggregated] = await Job.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                locations: { $addToSet: "$location" },
                jobTypes: { $addToSet: "$jobType" },
                salaries: { $addToSet: "$salary" },
                experienceLevels: { $addToSet: "$experienceLevel" },
                categories: { $addToSet: "$aiMetadata.category" },
            },
        },
    ]);

    const raw = aggregated || {};

    return {
        locations: cleanValues(raw.locations),
        jobTypes: cleanValues(raw.jobTypes),
        salaries: cleanValues(raw.salaries),
        experienceLevels: cleanValues(raw.experienceLevels),
        categories: cleanValues(raw.categories),
    };
};
