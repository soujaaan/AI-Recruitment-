import mongoose from "mongoose";

const interviewerDetailsSchema = new mongoose.Schema(
    {
        name: { type: String, default: "" },
        role: { type: String, default: "" },
        email: { type: String, default: "" },
    },
    { _id: false }
);

const interviewFeedbackSchema = new mongoose.Schema(
    {
        technicalRating: { type: Number, min: 1, max: 5 },
        communicationRating: { type: Number, min: 1, max: 5 },
        problemSolvingRating: { type: Number, min: 1, max: 5 },
        culturalFit: { type: Number, min: 1, max: 5 },
        recommendation: {
            type: String,
            enum: ["strong hire", "hire", "neutral", "reject", "pending"],
            default: "pending",
        },
        notes: { type: String, default: "" },
    },
    { _id: false }
);

const interviewScheduleSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            index: true,
        },
        application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", index: true },

        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },

        roundType: {
            type: String,
            enum: ["HR", "Technical", "Final", "Panel"],
            default: "Technical",
        },
        meetLink: { type: String, trim: true, default: "" },
        meetingLink: { type: String, trim: true, default: "" },

        scheduledAt: { type: Date, required: true, index: true },
        durationMinutes: { type: Number, default: 45, min: 15 },
        timezone: { type: String, default: "UTC" },

        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled", "rescheduled"],
            default: "scheduled",
            index: true,
        },

        interviewerDetails: { type: interviewerDetailsSchema, default: () => ({}) },
        feedback: { type: interviewFeedbackSchema, default: () => ({}) },
        notes: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

const syncInterviewFields = (doc) => {
    if (doc.applicationId && !doc.application) doc.application = doc.applicationId;
    if (doc.application && !doc.applicationId) doc.applicationId = doc.application;
    if (doc.recruiterId && !doc.recruiter) doc.recruiter = doc.recruiterId;
    if (doc.recruiter && !doc.recruiterId) doc.recruiterId = doc.recruiter;
    if (doc.candidateId && !doc.candidate) doc.candidate = doc.candidateId;
    if (doc.candidate && !doc.candidateId) doc.candidateId = doc.candidate;
    if (doc.jobId && !doc.job) doc.job = doc.jobId;
    if (doc.job && !doc.jobId) doc.jobId = doc.job;
    if (doc.meetLink && !doc.meetingLink) doc.meetingLink = doc.meetLink;
    if (doc.meetingLink && !doc.meetLink) doc.meetLink = doc.meetingLink;
};

interviewScheduleSchema.pre("save", function (next) {
    syncInterviewFields(this);
    next();
});

interviewScheduleSchema.index({ candidateId: 1, scheduledAt: -1 });
interviewScheduleSchema.index({ recruiterId: 1, scheduledAt: -1 });
interviewScheduleSchema.index({ jobId: 1, candidateId: 1 });
interviewScheduleSchema.index({ applicationId: 1, status: 1 });

export const InterviewSchedule = mongoose.model("InterviewSchedule", interviewScheduleSchema);
