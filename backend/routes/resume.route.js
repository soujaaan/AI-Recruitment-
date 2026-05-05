import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { parseResume } from "../controllers/resume.controller.js";

const router = express.Router();

router.route("/parse").post(isAuthenticated, parseResume);

export default router;
