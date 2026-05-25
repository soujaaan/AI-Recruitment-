import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connectDB = async () => {
    try {
        console.log("🔌 Attempting MongoDB connection...");
        console.log("MONGO_URI EXISTS:", !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
