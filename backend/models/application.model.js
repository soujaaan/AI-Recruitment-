import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['applied', 'under review', 'shortlisted', 'interview scheduled', 'rejected', 'hired'],
        default:'applied'
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    },
    atsScore: {
        type: Number,
        default: 0
    },
    assessmentAttempt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentAttempt'
    },
    assessmentScore: {
        type: Number,
        default: 0
    },
    aiRanking: {
        type: String,
        enum: ['Highly Recommended', 'Recommended', 'Average Fit', 'Weak Match'],
        default: 'Average Fit'
    },
    aiEvaluationSummary: {
        type: String,
        default: ""
    },
    timeEfficiency: {
        type: Number, // Percentage or seconds metric
        default: 0
    }
},{timestamps:true});

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, createdAt: -1 });

export const Application  = mongoose.model("Application", applicationSchema);
