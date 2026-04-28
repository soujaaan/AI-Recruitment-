import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
    },
    website: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    logo: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

companySchema.index({ createdBy: 1, createdAt: -1 });

export const Company = mongoose.model("Company", companySchema);

