import { CandidateProfile } from "../models/candidateProfile.model.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.id;
        console.log("[getProfile] userId:", userId);

        let profile = await CandidateProfile.findOne({ userId }).lean();

        if (!profile) {
            return res.status(200).json({
                message: "No profile found — returning empty",
                profile: null,
                success: true
            });
        }

        console.log("[getProfile] Found profile:", {
            experience: profile.experience?.length,
            projects: profile.projects?.length,
            education: Object.keys(profile.education || {}),
        });

        return res.status(200).json({
            profile,
            success: true
        });
    } catch (error) {
        console.error("[getProfile] Error:", error);
        return res.status(500).json({
            message: "Server Error",
            success: false
        });
    }
};

export const saveProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.id;
        const profileData = req.body;

        console.log("[saveProfile] userId:", userId);
        console.log("[saveProfile] received keys:", Object.keys(profileData));
        console.log("[saveProfile] experience count:", Array.isArray(profileData.experience) ? profileData.experience.length : "N/A");
        console.log("[saveProfile] projects count:", Array.isArray(profileData.projects) ? profileData.projects.length : "N/A");
        console.log("[saveProfile] education keys:", profileData.education ? Object.keys(profileData.education) : "N/A");
        console.log("[saveProfile] full payload:", JSON.stringify(profileData, null, 2));

        // Build sanitized payload FIRST — in correct order
        const allowed = [
            "personalInfo",
            "summary",
            "skills",
            "experience",
            "projects",
            "education",
            "completionPercentage",
            "resumePdfUrl"
        ];
        const sanitized = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(profileData, key)) {
                sanitized[key] = profileData[key];
            }
        }

        // Ensure nested arrays default to empty array (not null/undefined)
        if (!Array.isArray(sanitized.experience)) sanitized.experience = [];
        if (!Array.isArray(sanitized.projects)) sanitized.projects = [];
        if (sanitized.education == null || typeof sanitized.education !== "object") {
            sanitized.education = {};
        }
        if (!Array.isArray(sanitized.skills)) sanitized.skills = [];

        console.log("[saveProfile] sanitized payload:", {
            experience: sanitized.experience?.length,
            projects: sanitized.projects?.length,
            education: Object.keys(sanitized.education || {}),
            skills: sanitized.skills?.length,
        });

        let profile = await CandidateProfile.findOne({ userId });

        if (profile) {
            profile = await CandidateProfile.findOneAndUpdate(
                { userId },
                { $set: sanitized },
                { new: true, runValidators: true }
            );
            console.log("[saveProfile] Updated existing profile:", profile._id);
        } else {
            profile = await CandidateProfile.create({
                userId,
                ...sanitized
            });
            console.log("[saveProfile] Created new profile:", profile._id);
        }

        console.log("[saveProfile] Saved result:", {
            experience: profile.experience?.length,
            projects: profile.projects?.length,
            education: Object.keys(profile.education || {}),
        });

        return res.status(200).json({
            message: "Profile saved successfully.",
            profile,
            success: true
        });
    } catch (error) {
        console.error("[saveProfile] Error:", error.message, error.stack);
        return res.status(500).json({
            message: error.message || "Server Error while saving profile.",
            success: false
        });
    }
};
