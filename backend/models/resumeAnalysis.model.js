import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    filePath: {
        type: String,
        required: true
    },
    extractedData: {
        type: Object,
        default: {}
    },
    ruleScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    aiScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    finalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    strengths: [{
        type: String
    }],
    weaknesses: [{
        type: String
    }],
    suggestions: [{
        type: String
    }]
}, { timestamps: true });

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
