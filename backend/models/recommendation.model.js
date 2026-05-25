import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
    {
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
        matchScore: { type: Number, min: 0, max: 100, default: 0 },
        reason: { type: String, default: "" },
        tags: [{ type: String, trim: true }],
        isDismissed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

recommendationSchema.index({ candidateId: 1, matchScore: -1 });

export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
