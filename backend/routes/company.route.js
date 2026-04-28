import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { singleUpload } from "../middlewares/mutler.js";
import {
    getCompany,
    getCompanyById,
    registerCompany,
    updateCompany,
} from "../controllers/company.controller.js";
import { validateObjectIdParam } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("recruiter"), singleUpload, registerCompany);
router.get("/", isAuthenticated, authorizeRoles("recruiter"), getCompany);
router.get("/:id", isAuthenticated, authorizeRoles("recruiter"), validateObjectIdParam("id"), getCompanyById);
router.put("/:id", isAuthenticated, authorizeRoles("recruiter"), validateObjectIdParam("id"), singleUpload, updateCompany);

export default router;

