import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "./logger.js";
import { ApiError } from "./apiError.js";

mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

// Global connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('Mongoose default connection opened to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose default connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose default connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose default connection reconnected');
});

process.on('SIGINT', async () => {
  logger.info('app is terminating');
  await mongoose.connection.close();
  process.exit(0);
});

const connectDB = async () => {
    try {
        if (!env.mongoUri) {
            const errorMsg = "MONGO_URI is not configured in environment";
            console.error(errorMsg);
            logger.error(errorMsg);
            throw new ApiError(500, errorMsg);
        }

        console.log('🔌 Attempting MongoDB connection...');

        const mongooseOptions = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            bufferCommands: false,
            family: 4
        };

        await mongoose.connect(env.mongoUri, mongooseOptions);
        logger.info("✅ MongoDB connected successfully to jobportal");

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        logger.error('MongoDB connection error:', { message: error.message, stack: error.stack });
        throw new ApiError(500, `Database connection failed: ${error.message}`);
    }
};

export default connectDB;
export { mongoose };