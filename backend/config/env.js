import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: toNumber(process.env.PORT, 5000),
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || process.env.SECRET_KEY,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    cookieMaxAgeMs: toNumber(process.env.COOKIE_MAX_AGE_MS, 24 * 60 * 60 * 1000),
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
    aiProvider: (process.env.AI_PROVIDER || "openai").toLowerCase(),
    aiModel: process.env.AI_MODEL || "gpt-4o-mini",
    openAiApiKey: process.env.OPENAI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    aiBaseUrl: process.env.AI_BASE_URL,
    rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 100),
    uploadMaxSizeMb: toNumber(process.env.UPLOAD_MAX_SIZE_MB, 5),
};

