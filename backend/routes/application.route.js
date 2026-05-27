import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
    applyJob,
    getAllApplications,
    getApplicants,
    getAppliedJobs,
    updateStatus,
    getJobApplicants,
    getJobMatchPreview,
} from "../controllers/application.controller.js";
import {
    validateApplicationSubmission,
    validateStatusUpdate,
    validateObjectIdParam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

// Recruiter / Admin: list applications across jobs (optional status filter)
// Supports: GET /api/v1/application?status=shortlisted
// Also available at: GET /api/applications?status=shortlisted
router.route("/").get(isAuthenticated, authorizeRoles("recruiter", "admin"), getAllApplications);

// Candidate: apply for a job (POST only)
router.route("/apply/:id").post(
    isAuthenticated,
    authorizeRoles("candidate"),
    validateApplicationSubmission,
    applyJob
);

// Candidate: job match preview before applying
router.route("/match/:jobId").get(
    isAuthenticated,
    authorizeRoles("candidate"),
    validateObjectIdParam("jobId"),
    getJobMatchPreview
);

// Candidate: view applied jobs
router.route("/get").get(isAuthenticated, authorizeRoles("candidate"), getAppliedJobs);
router.route("/applications").get(isAuthenticated, authorizeRoles("candidate"), getAppliedJobs);

// Recruiter / Admin: view applicants for a job
router.route("/:id/applicants").get(
    isAuthenticated,
    authorizeRoles("recruiter", "admin"),
    validateObjectIdParam("id"),
    getApplicants
);

// User explicit requested route: GET /api/applications/job/:jobId
router.route("/job/:jobId").get(
    isAuthenticated,
    authorizeRoles("recruiter", "admin"),
    validateObjectIdParam("jobId"),
    getJobApplicants
);

// Recruiter / Admin: update application status
router.route("/status/:id/update").post(
    isAuthenticated,
    authorizeRoles("recruiter", "admin"),
    validateObjectIdParam("id"),
    validateStatusUpdate,
    updateStatus
);

export default router;

