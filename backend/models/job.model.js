import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    requirements: [{
        type: String,
        trim: true
    }],
    salary: {
        type: Number,
        required: true
    },
    experienceLevel: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    jobType: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ created_by: 1, createdAt: -1 });
jobSchema.index({ company: 1, createdAt: -1 });
jobSchema.index({ isActive: 1 });

export const Job = mongoose.model("Job", jobSchema);

