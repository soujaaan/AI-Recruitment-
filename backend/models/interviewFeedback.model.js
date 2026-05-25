import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema(
    {
        interviewScheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterviewSchedule",
            required: true,
            index: true,
        },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        rating: { type: Number, min: 1, max: 5 },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        notes: { type: String, default: "" },
        recommendation: {
            type: String,
            enum: ["hire", "hold", "reject", "pending"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export const InterviewFeedback = mongoose.model("InterviewFeedback", interviewFeedbackSchema);
