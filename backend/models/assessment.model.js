import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        questionBankIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" }],
        durationMinutes: { type: Number, default: 60 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Assessment = mongoose.model("Assessment", assessmentSchema);
