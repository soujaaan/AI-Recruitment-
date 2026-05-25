import mongoose from "mongoose";

const candidateAssessmentSchema = new mongoose.Schema(
    {
        assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
        status: {
            type: String,
            enum: ["assigned", "in_progress", "completed", "expired"],
            default: "assigned",
        },
        assignedAt: { type: Date, default: Date.now },
        dueAt: { type: Date },
    },
    { timestamps: true }
);

candidateAssessmentSchema.index({ candidateId: 1, assessmentId: 1 }, { unique: true });

export const CandidateAssessment = mongoose.model("CandidateAssessment", candidateAssessmentSchema);
