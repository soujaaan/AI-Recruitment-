import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
    deleteJob,
    getAdminJobs,
    getAllJobs,
    getJobById,
    postJob,
    updateJob,
} from "../controllers/job.controller.js";
import { validateJobCreation, validateObjectIdParam } from "../middlewares/validation.middleware.js";

const router = express.Router();

// Public job browsing — no auth required
router.route("/jobs").get(getAllJobs);
router.route("/get").get(getAllJobs);
router.route("/get/:id").get(validateObjectIdParam("id"), getJobById);
router.route("/jobs/:id").get(validateObjectIdParam("id"), getJobById);

// Recruiter / Admin job management
router.route("/post").post(isAuthenticated, authorizeRoles("recruiter", "admin"), validateJobCreation, postJob);
router.route("/getadminjobs").get(isAuthenticated, authorizeRoles("recruiter", "admin"), getAdminJobs);
router.route("/:id")
    .patch(isAuthenticated, authorizeRoles("recruiter", "admin"), validateObjectIdParam("id"), updateJob)
    .delete(isAuthenticated, authorizeRoles("recruiter", "admin"), validateObjectIdParam("id"), deleteJob);

export default router;

