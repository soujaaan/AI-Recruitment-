import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";


import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import connectDB from "./utils/db.js";
import { logger } from "./utils/logger.js";
import userRoute from "./routes/user.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import companyRoute from "./routes/company.route.js";
import adminRoute from "./routes/admin.route.js";
import resumeRoute from "./routes/resume.route.js";
import atsRoute from "./routes/ats.route.js";

import authRoute from "./routes/auth.route.js";
import aiRoutes from "./routes/ai.routes.js";
import profileRoute from "./routes/profile.route.js";
import candidateRoute from "./routes/candidate.route.js";
import chatRoute from "./routes/chat.route.js";
import interviewRoute from "./routes/interview.route.js";
import { requestLogger } from "./utils/requestLogger.js";
import { attachChatSocket } from "./socket/chat.socket.js";

import path from "path";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { User } from "./models/user.model.js";
import bcrypt from "bcryptjs";

const app = express();

// Required behind Render/Vercel reverse proxies so rate-limit uses real client IPs
app.set("trust proxy", 1);

const corsOrigins = [
    env.clientUrl,
    "https://ai-recruitment-seven.vercel.app",
    "http://localhost:5173",
].filter(Boolean);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

const globalLimiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

// Auth routes have dedicated limiters; avoid double 429 on signup/OTP
app.use((req, res, next) => {
    if (req.path.startsWith("/api/auth")) {
        return next();
    }
    return globalLimiter(req, res, next);
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(requestLogger);



// API Routes
app.use("/api/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/applications", applicationRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/admin", adminRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/ats", atsRoute);

app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoute);
app.use("/api/candidates", candidateRoute);
app.use("/api/chat", chatRoute);
app.use("/api/interviews", interviewRoute);

// Serve uploads folder locally
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
    
    // Optional admin seeding (never runs by default)
    if (process.env.SEED_ADMIN === "true") {
        // Safety: do not seed in production unless explicitly enabled
        if (env.nodeEnv === "production") {
            logger.warn("SEED_ADMIN enabled in production; proceeding with admin seeding.");
        }

        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminEmail || !adminPassword) {
                throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set when SEED_ADMIN=true");
            }

            const adminExists = await User.findOne({ email: adminEmail });
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                await User.create({
                    fullname: "System Admin",
                    email: adminEmail,
                    phoneNumber: "0000000000",
                    password: hashedPassword,
                    role: "admin",
                    profile: {
                        profilePhoto: "",
                    },
                });
                logger.info("Admin account seeded via SEED_ADMIN flag.");
            } else {
                logger.info("Admin account already exists; skipping seeding.");
            }
        } catch (error) {
            logger.error("Failed to seed admin", { message: error?.message });
        }
    }


    const server = app.listen(env.port, () => {
        logger.info(`Server running on port ${env.port}`);
    });

    // Socket.io (chat)
    attachChatSocket(server);
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

