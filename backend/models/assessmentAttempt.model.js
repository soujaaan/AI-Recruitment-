import mongoose from "mongoose";

const assessmentAttemptSchema = new mongoose.Schema({
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    status: {
        type: String,
        enum: ["in-progress", "completed", "timeout"],
        default: "in-progress"
    },
    questions: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        points: Number
    }],
    answers: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        answer: String,
        isCorrect: Boolean,
        score: Number
    }],
    score: {
        type: Number,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    durationLimit: {
        type: Number, // in minutes
        required: true
    },
    duration: {
        type: Number, // actual duration in seconds
        default: 0
    },
    aiEvaluation: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Ensure candidate can't have multiple active attempts for same job
assessmentAttemptSchema.index({ candidate: 1, job: 1, status: 1 });

export const AssessmentAttempt = mongoose.model("AssessmentAttempt", assessmentAttemptSchema);
