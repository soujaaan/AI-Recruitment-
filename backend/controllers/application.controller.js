import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import {
    calculateSkillMatch,
    collectCandidateSkills,
} from "../utils/skillMatch.util.js";
import { getJobRequiredSkills } from "../utils/schemaSync.js";
import { jobApplicationMatch } from "../utils/jobApplicantCounts.js";

import { notificationService } from "../services/notification.service.js";
import mongoose from "mongoose";

const CANONICAL_ATS_STATUSES = ["applied", "shortlisted", "interview", "hired", "rejected"];

// Canonical status for API querying + UI display.
// Note: DB persisted values still use legacy variants like
// "interview scheduled" and "interview completed".
const toCanonicalAtsStatus = (value) => {
    const s = String(value || "").trim().toLowerCase();
    if (!s) return "applied";
    if (CANONICAL_ATS_STATUSES.includes(s)) return s;

    // Legacy / verbose statuses → canonical
    if (s === "under review") return "applied";
    if (s === "interview scheduled" || s === "interview completed") return "interview";
    return s; // keep unknowns as-is (will be rejected on updates)
};

const buildCanonicalStatusQuery = (status) => {
    const canonical = toCanonicalAtsStatus(status);
    if (!CANONICAL_ATS_STATUSES.includes(canonical)) {
        throw new ApiError(400, "Invalid status value");
    }
    // Match canonical + legacy values that should map to it (for existing data)
    if (canonical === "interview") {
        return { $in: ["interview", "interview scheduled", "interview completed"] };
    }
    if (canonical === "applied") {
        return { $in: ["applied", "under review"] };
    }
    return canonical;
};

const toPersistedAtsStatus = ({ requestedStatus, canonicalStatus, currentPersistedStatus }) => {
    const requested = String(requestedStatus || "").trim().toLowerCase();
    const current = String(currentPersistedStatus || "").trim().toLowerCase();

    // Preserve legacy interview completion if caller explicitly requests it.
    if (requested === "interview completed") return "interview completed";
    if (requested === "interview scheduled") return "interview scheduled";

    // If caller uses canonical "interview", preserve current interview stage when possible.
    if (canonicalStatus === "interview") {
        if (current === "interview completed") return "interview completed";
        return "interview scheduled";
    }

    // For the other pipeline stages, canonical values are already persisted enums.
    return canonicalStatus;
};

const canManageApplication = (job, user) =>
    user?.role === "admin" ||
    String(job.created_by) === String(user?.id) ||
    String(job.recruiterId) === String(user?.id);

const applicationQueryForJob = (jobId) => jobApplicationMatch(jobId);

export const applyJob = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const userRole = req.user?.role;
    const jobId = req.params.id || req.params.jobId;

    console.log("===== APPLICATION DEBUG =====");
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    console.log("User:", req.user?.id || req.id, req.user?.role);
    console.log("JobId Received:", jobId);

    // Only candidates can apply
    if (userRole && userRole.toLowerCase() !== "candidate") {
        throw new ApiError(403, "Only candidates can apply for jobs");
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.isActive === false) {
        throw new ApiError(400, "This job is no longer accepting applications");
    }

    const existingApplication = await Application.findOne({
        $and: [
            applicationQueryForJob(jobId),
            { $or: [{ applicant: userId }, { candidateId: userId }] },
        ],
    });
    if (existingApplication) {
        throw new ApiError(400, "You have already applied for this job");
    }

    const userResume = await Resume.findOne({ $or: [{ userId }, { applicant: userId }] });
    const [candidateProfile, resumeAnalysis, applicantUser] = await Promise.all([
        CandidateProfile.findOne({ userId }).lean(),
        ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        User.findById(userId).select("profile").lean(),
    ]);

    const candidateSkills = collectCandidateSkills({
        profile: candidateProfile,
        userProfile: applicantUser?.profile,
        resumeAnalysis,
    });
    const { matchScore, matchedSkills, missingSkills } = calculateSkillMatch(
        candidateSkills,
        getJobRequiredSkills(job)
    );
    const atsScore =
        resumeAnalysis?.atsScore ??
        applicantUser?.profile?.atsScore ??
        0;

    const latestRole = candidateProfile?.experience?.[0];
    const snapshot = {
        fullName: candidateProfile?.personalInfo?.fullName || req.user?.fullname || "",
        title: latestRole?.title || candidateProfile?.headline || "",
        skills: candidateSkills,
        experience: candidateProfile?.experience || [],
        education: candidateProfile?.education || null,
        certifications: candidateProfile?.certifications || [],
        projects: candidateProfile?.projects || [],
        resumeUrl: candidateProfile?.resumePdfUrl || userResume?.fileUrl || "",
    };
    const appliedAt = new Date();

    let application;
    try {
        application = await Application.create({
            job: jobId,
            jobId,
            applicant: userId,
            candidateId: userId,
            candidate: userId,
            recruiterId: job.recruiterId || job.created_by,
            recruiter: job.recruiterId || job.created_by,
            companyId: job.companyId,
            candidateProfile: candidateProfile?._id,
            status: "applied",
            applicationStatus: "applied",
            resumeId: userResume ? userResume._id : null,
            resume: userResume?._id,
            atsScore,
            matchScore,
            aiMatchScore: matchScore,
            matchedSkills,
            missingSkills,
            snapshot,
            timeline: [{ stage: "Applied", timestamp: appliedAt }],
            appliedAt,
        });
    } catch (err) {
        console.error("Application Creation Failed:", err);
        throw new ApiError(400, `Validation failed: ${err.message}`);
    }

    // Trigger Notification to Recruiter
    try {
        await notificationService.createNotification({
            recipient: application.recruiterId || application.recruiter || job.recruiterId || job.created_by,
            type: "NEW_APPLICATION",
            title: "New Application Received",
            message: "A new candidate has applied for your job.",
            entityType: "Application",
            entityId: application._id,
            priority: "medium",
            metadata: {
                jobId: job._id,
                jobTitle: job.title,
                candidateName: req.user?.fullname || "A candidate"
            }
        });
    } catch (notificationError) {
        console.error("Failed to trigger application notification:", notificationError);
    }

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

export const getApplicationsWithProfiles = async (query, skip = 0, limit = 100, sortBy = "atsScore") => {
    const rawApps = await Application.find(query)
        .sort({ [sortBy]: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: "candidate",
            select: "_id fullname email phoneNumber role profile company companyId profilePhoto"
        })
        .populate({
            path: "applicant",
            select: "_id fullname email phoneNumber role profile company companyId profilePhoto"
        })
        .populate({
            path: "candidateProfile"
        })
        .populate({
            path: "resume"
        })
        .populate({
            path: "job"
        });

    return rawApps.map(app => {
        const doc = app.toObject ? app.toObject() : app;
        
        // Recover orphaned relations or missing fields
        const candidateUser = doc.candidate || doc.applicant;
        if (!candidateUser) {
            doc.status = "orphaned";
            doc.applicationStatus = "orphaned";
        }
        
        // Ensure compatibilities for legacy codes
        if (!doc.applicant && doc.candidate) doc.applicant = doc.candidate;
        if (!doc.candidate && doc.applicant) doc.candidate = doc.applicant;
        if (!doc.jobId && doc.job) doc.jobId = doc.job._id;
        if (!doc.job && doc.jobId) doc.job = doc.jobId;
        if (!doc.candidateProfile && candidateUser && candidateUser.profile) {
            doc.candidateProfile = candidateUser.profile;
        }

        // Normalize ATS statuses at the API boundary (keeps UI consistent)
        doc.status = toCanonicalAtsStatus(doc.status);
        if (doc.applicationStatus) {
            doc.applicationStatus = toCanonicalAtsStatus(doc.applicationStatus);
        }
        return doc;
    });
};

export const getAllApplications = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const query = {};
    if (req.user?.role !== "admin") {
        query.$or = [{ recruiterId: userId }, { recruiter: userId }];
    }
    if (status) {
        query.status = buildCanonicalStatusQuery(status);
    }

    const totalApplications = await Application.countDocuments(query);
    const applications = await getApplicationsWithProfiles(query, skip, limit, "createdAt");

    return sendSuccess(
        res,
        200,
        {
            applications,
            pagination: buildPaginationMeta(totalApplications, page, limit),
        },
        "Applications fetched successfully",
        { applications }
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

    const jobQuery = applicationQueryForJob(jobId);
    const totalApplications = await Application.countDocuments(jobQuery);

    const sortField = req.query.sortBy === "match" ? "matchScore" : "atsScore";
    const applications = await getApplicationsWithProfiles(jobQuery, skip, limit, sortField);

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

export const getJobMatchPreview = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const jobId = req.params.jobId;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid Job ID");
    }

    const job = await Job.findById(jobId).select("title requirements requiredSkills");
    if (!job) throw new ApiError(404, "Job not found");

    const [candidateProfile, resumeAnalysis, user] = await Promise.all([
        CandidateProfile.findOne({ userId }).lean(),
        ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        User.findById(userId).select("profile").lean(),
    ]);

    const candidateSkills = collectCandidateSkills({
        profile: candidateProfile,
        userProfile: user?.profile,
        resumeAnalysis,
    });
    const match = calculateSkillMatch(candidateSkills, getJobRequiredSkills(job));

    return sendSuccess(
        res,
        200,
        {
            jobId: job._id,
            jobTitle: job.title,
            requiredSkills: getJobRequiredSkills(job),
            ...match,
            atsScore: resumeAnalysis?.atsScore ?? user?.profile?.atsScore ?? 0,
        },
        "Match preview calculated"
    );
});

export const getJobApplicants = asyncHandler(async (req, res) => {
    const jobId = req.params.jobId;
    const { sortBy, minMatchScore, minAtsScore, skill } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (!canManageApplication(job, req.user)) {
        throw new ApiError(403, "You do not own this job");
    }

    const sortField = sortBy === "match" ? "matchScore" : sortBy === "ats" ? "atsScore" : "createdAt";
    let applications = await getApplicationsWithProfiles(applicationQueryForJob(jobId), 0, 1000, sortField);

    applications = applications.map((app) => {
        const candidateUser = app.candidate || app.applicant;
        const profile = app.candidateProfile;
        const resumeUrl =
            profile?.resumePdfUrl ||
            candidateUser?.profile?.resume ||
            "";
        return {
            ...app,
            candidateProfile: profile || null,
            resumeUrl,
        };
    });

    if (skill) {
        const skillLower = String(skill).toLowerCase();
        applications = applications.filter((app) => {
            const candidateUser = app.candidate || app.applicant;
            const skills = [
                ...(app.matchedSkills || []),
                ...(candidateUser?.profile?.skills || []),
                ...(app.candidateProfile?.skills || []),
            ];
            return skills.some((s) => String(s).toLowerCase().includes(skillLower));
        });
    }

    if (minMatchScore !== undefined) {
        const min = Number(minMatchScore);
        if (!Number.isNaN(min)) {
            applications = applications.filter((app) => (app.matchScore || 0) >= min);
        }
    }

    if (minAtsScore !== undefined) {
        const min = Number(minAtsScore);
        if (!Number.isNaN(min)) {
            applications = applications.filter((app) => (app.atsScore || 0) >= min);
        }
    }

    return res.status(200).json(applications);
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

    const canonicalRequestedStatus = toCanonicalAtsStatus(status);
    if (!CANONICAL_ATS_STATUSES.includes(canonicalRequestedStatus)) {
        throw new ApiError(400, "Invalid status value");
    }

    const currentStatus = application.status;
    const canonicalCurrentStatus = toCanonicalAtsStatus(currentStatus);
    const requestedLower = String(status || "").trim().toLowerCase();
    const currentLower = String(currentStatus || "").trim().toLowerCase();

    const isInterviewScheduledToCompleted =
        canonicalCurrentStatus === "interview" &&
        canonicalRequestedStatus === "interview" &&
        currentLower === "interview scheduled" &&
        requestedLower === "interview completed";

    const transitions = {
        applied: ["shortlisted", "rejected", "interview"],
        shortlisted: ["rejected", "interview", "hired"],
        interview: ["hired", "rejected", "shortlisted"],
        rejected: [],
        hired: [],
    };

    if (canonicalCurrentStatus === canonicalRequestedStatus && !isInterviewScheduledToCompleted) {
        throw new ApiError(400, `Application is already ${currentStatus}`);
    }

    if (!isInterviewScheduledToCompleted && !transitions[canonicalCurrentStatus]?.includes(canonicalRequestedStatus)) {
        throw new ApiError(400, `Cannot transition from ${canonicalCurrentStatus} to ${canonicalRequestedStatus}`);
    }

    application.status = toPersistedAtsStatus({
        requestedStatus: status,
        canonicalStatus: canonicalRequestedStatus,
        currentPersistedStatus: application.status,
    });
    application.applicationStatus = application.status;
    await application.save();

    // Trigger Notification to Candidate
    try {
        if (canonicalRequestedStatus === "shortlisted") {
            await notificationService.createNotification({
                recipient: application.applicant || application.candidate || application.candidateId,
                type: "APPLICATION_STATUS_UPDATED",
                title: "Application Shortlisted",
                message: "Congratulations, you have been shortlisted.",
                entityType: "Application",
                entityId: application._id,
                priority: "high",
                metadata: {
                    jobId: application.job?._id || application.jobId || application.job,
                    jobTitle: application.job?.title || "your job application"
                }
            });
        } else if (canonicalRequestedStatus === "rejected") {
            await notificationService.createNotification({
                recipient: application.applicant || application.candidate || application.candidateId,
                type: "APPLICATION_STATUS_UPDATED",
                title: "Application Update",
                message: "Your application was not selected.",
                entityType: "Application",
                entityId: application._id,
                priority: "medium",
                metadata: {
                    jobId: application.job?._id || application.jobId || application.job,
                    jobTitle: application.job?.title || "your job application"
                }
            });
        }
    } catch (notificationError) {
        console.error("Failed to trigger application status notification:", notificationError);
    }

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

