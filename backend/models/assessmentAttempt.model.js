import mongoose from "mongoose";

const assessmentAttemptSchema = new mongoose.Schema(
    {
        candidateAssessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CandidateAssessment",
            required: true,
            index: true,
        },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        answers: { type: mongoose.Schema.Types.Mixed, default: {} },
        score: { type: Number, min: 0, max: 100, default: 0 },
        startedAt: { type: Date, default: Date.now },
        submittedAt: { type: Date },
    },
    { timestamps: true }
);

export const AssessmentAttempt = mongoose.model("AssessmentAttempt", assessmentAttemptSchema);
