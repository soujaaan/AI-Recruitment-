import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        questionBankId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank", required: true, index: true },
        text: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, default: "" },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
        tags: [{ type: String, trim: true }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
