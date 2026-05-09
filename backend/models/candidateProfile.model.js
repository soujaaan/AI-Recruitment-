import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    personalInfo: {
        fullName: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
        portfolio: String
    },
    summary: String,
    skills: [{ type: String }],
    experience: [{
        company: String,
        title: String,
        type: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        location: String,
        skills: [{ type: String }],
        responsibilities: String
    }],
    projects: [{
        title: String,
        description: String,
        skills: [{ type: String }],
        github: String,
        live: String,
        duration: String,
        teamSize: String
    }],
    education: {
        secondary: { school: String, board: String, passingYear: String, score: String },
        higherSecondary: { school: String, board: String, stream: String, passingYear: String, score: String },
        graduation: { college: String, degree: String, specialization: String, university: String, startYear: String, endYear: String, cgpa: String },
        postGraduation: { college: String, degree: String, specialization: String, university: String, startYear: String, endYear: String, cgpa: String }
    },
    completionPercentage: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
