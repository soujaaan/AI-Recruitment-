import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['DELETE_JOB', 'BLOCK_USER', 'UNBLOCK_USER', 'DELETE_COMPANY', 'OVERRIDE_APPLICATION', 'FLAG_JOB', 'UNFLAG_JOB', 'DISABLE_JOB', 'ENABLE_JOB', 'SOFT_DELETE_USER'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetModel: {
        type: String,
        enum: ['Job', 'User', 'Company', 'Application'],
        required: true
    },
    details: {
        type: String
    }
}, { timestamps: true });

export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
