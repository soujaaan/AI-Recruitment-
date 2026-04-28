import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import connectDB from "./utils/db.js";
import { logger } from "./utils/logger.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import { requestLogger } from "./utils/requestLogger.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Trust proxy only in production with verified reverse proxy
if (env.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(
    rateLimit({
        windowMs: env.rateLimitWindowMs,
        max: env.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests. Please try again later.",
        },
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(requestLogger);

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: "ok",
            timestamp: new Date().toISOString(),
        },
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    await connectDB();
    app.listen(env.port, () => {
        logger.info(`Server running on port ${env.port}`);
    });
};

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", { reason });
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { error });
    process.exit(1);
});

startServer().catch((error) => {
    console.error("💥 Server startup failed:", error.message);
    logger.error("Failed to start server", {
        message: error.message,
        stack: error.stack,
        code: error.code,
    });
    process.exit(1);
});

