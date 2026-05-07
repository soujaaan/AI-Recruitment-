import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    predictedRole: {
        type: String,
        default: ""
    },
    skills: [{
        type: String
    }],
    strengths: [{
        type: String
    }],
    weaknesses: [{
        type: String
    }],
    recommendations: [{
        type: String
    }],
    analyzedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
export default ResumeAnalysis;
