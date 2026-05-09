import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["mcq", "text"],
        required: true
    },
    options: [{
        type: String
    }],
    correctAnswer: {
        type: String
    },
    points: {
        type: Number,
        default: 1
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },
    skill: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);
