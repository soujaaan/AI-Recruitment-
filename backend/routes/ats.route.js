import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { calculateATS } from "../controllers/ats.controller.js";

const router = express.Router();

router.route("/calculate").post(isAuthenticated, calculateATS);

export default router;
