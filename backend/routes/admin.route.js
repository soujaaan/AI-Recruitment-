import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { AdminLog } from "../models/adminLog.model.js";

const router = express.Router();

const isAdmin = authorizeRoles("admin");

// helper to create log
const createLog = async (adminId, action, targetId, targetModel, details) => {
    await AdminLog.create({ adminId, action, targetId, targetModel, details });
};

// 1. Dashboard & Analytics
router.get("/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRecruiters = await User.countDocuments({ role: "recruiter" });
        const totalCandidates = await User.countDocuments({ role: { $in: ["candidate", "Candidate"] } });
        const totalCompanies = await Company.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();
        
        const activeJobs = await Job.countDocuments({ isActive: true });
        const inactiveJobs = await Job.countDocuments({ isActive: false });

        // Aggregation: Jobs per Recruiter
        const jobsPerRecruiter = await Job.aggregate([
            { $group: { _id: "$created_by", count: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "recruiter" } },
            { $unwind: "$recruiter" },
            { $project: { _id: 0, recruiterName: "$recruiter.fullname", count: 1 } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Aggregation: Conversion Rates
        const statusCounts = await Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const totalApps = statusCounts.reduce((acc, curr) => acc + curr.count, 0);
        const shortlisted = statusCounts.find(s => s._id === "shortlisted")?.count || 0;
        const conversionRate = totalApps > 0 ? ((shortlisted / totalApps) * 100).toFixed(2) + "%" : "0%";

        res.status(200).json({
            success: true,
            data: {
                overview: { 
                    totalUsers, totalRecruiters, totalCandidates, totalCompanies, 
                    totalJobs, totalApplications, activeJobs, inactiveJobs,
                    conversionRate, jobsPerRecruiter, statusCounts
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Users Management
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } }).select("-password");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.put("/users/:id/block", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();

        await createLog(req.id, user.isBlocked ? "BLOCK_USER" : "UNBLOCK_USER", user._id, "User", `User ${user.isBlocked ? 'blocked' : 'unblocked'}`);

        res.status(200).json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.delete("/users/:id/soft-delete", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isActive = false;
        await user.save();

        await createLog(req.id, "SOFT_DELETE_USER", user._id, "User", "User soft deleted");

        res.status(200).json({ success: true, message: "User soft deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 3. Jobs Management
router.get("/jobs", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const jobs = await Job.find().populate("created_by", "fullname email").populate("company");
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.put("/jobs/:id/toggle-active", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        job.isActive = !job.isActive;
        await job.save();

        await createLog(req.id, job.isActive ? "ENABLE_JOB" : "DISABLE_JOB", job._id, "Job", `Job ${job.isActive ? 'enabled' : 'disabled'}`);

        res.status(200).json({ success: true, message: `Job ${job.isActive ? 'enabled' : 'disabled'} successfully`, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.put("/jobs/:id/flag", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        job.isFlagged = !job.isFlagged;
        await job.save();

        await createLog(req.id, job.isFlagged ? "FLAG_JOB" : "UNFLAG_JOB", job._id, "Job", `Job ${job.isFlagged ? 'flagged' : 'unflagged'}`);

        res.status(200).json({ success: true, message: `Job ${job.isFlagged ? 'flagged' : 'unflagged'} successfully`, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.delete("/jobs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        job.isActive = false;
        await job.save();

        await createLog(req.id, "DELETE_JOB", job._id, "Job", "Job soft deleted (disabled)");

        res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 4. Companies Management
router.get("/companies", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const companies = await Company.find().populate("userId", "fullname email");
        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.delete("/companies/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        await Company.findByIdAndDelete(req.params.id);
        
        await createLog(req.id, "DELETE_COMPANY", company._id, "Company", "Company deleted");

        res.status(200).json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 5. Applications Pipeline
router.get("/applications", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const applications = await Application.find()
            .populate("applicant", "fullname email")
            .populate({
                path: "job",
                populate: { path: "company" }
            });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.put("/applications/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        application.status = status;
        await application.save();

        await createLog(req.id, "OVERRIDE_APPLICATION", application._id, "Application", `Application status changed to ${status}`);

        res.status(200).json({ success: true, message: "Application status updated successfully", data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 6. Admin Logs
router.get("/logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const logs = await AdminLog.find().populate("adminId", "fullname email").sort("-createdAt");
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;
