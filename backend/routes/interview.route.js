import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
    scheduleInterview,
    getMyInterviews,
    getJobInterviews,
} from "../controllers/interview.controller.js";

const router = express.Router();

router.post(
    "/schedule",
    isAuthenticated,
    authorizeRoles("recruiter", "admin"),
    scheduleInterview
);

router.get(
    "/me",
    isAuthenticated,
    authorizeRoles("candidate"),
    getMyInterviews
);

router.get(
    "/job/:jobId",
    isAuthenticated,
    authorizeRoles("recruiter", "admin"),
    getJobInterviews
);

export default router;
