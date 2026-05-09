import { CandidateProfile } from "../models/candidateProfile.model.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.id;
        let profile = await CandidateProfile.findOne({ userId });
        
        if (!profile) {
            return res.status(404).json({
                message: "Profile not found",
                success: false
            });
        }
        
        return res.status(200).json({
            profile,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server Error",
            success: false
        });
    }
};

export const saveProfile = async (req, res) => {
    try {
        const userId = req.id;
        const profileData = req.body;

        let profile = await CandidateProfile.findOne({ userId });

        if (profile) {
            profile = await CandidateProfile.findOneAndUpdate(
                { userId },
                { $set: profileData },
                { new: true }
            );
        } else {
            profile = await CandidateProfile.create({
                userId,
                ...profileData
            });
        }

        return res.status(200).json({
            message: "Profile saved successfully.",
            profile,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server Error while saving profile.",
            success: false
        });
    }
};
