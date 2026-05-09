import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
    applyJob,
    getApplicants,
    getAppliedJobs,
    updateStatus,
    getJobApplicants,
} from "../controllers/application.controller.js";
import {
    validateApplicationSubmission,
    validateStatusUpdate,
    validateObjectIdParam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

// Candidate: apply for a job (POST only)
router.route("/apply/:id").post(
    isAuthenticated,
    authorizeRoles("candidate"),
    validateApplicationSubmission,
    applyJob
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

