import { ApiError } from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

const formatError = (error) => {
    if (!error) {
        return null;
    }

    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            ...(error.stack ? { stack: error.stack } : {}),
        };
    }

    return error;
};

export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    // Handle malformed JSON
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON payload",
            error: error.message,
        });
    }

    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal server error";
    let details = error.error || null;

    if (error.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
        details = Object.values(error.errors).map((item) => item.message);
    }

    if (error.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${error.path}`;
        details = error.value;
    }

    if (error.code === 11000) {
        statusCode = 400;
        message = "Duplicate key error";
        details = error.keyValue;
    }

    if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    if (!(error instanceof ApiError) && statusCode === 500) {
        details = formatError(error);
    }

    logger.error(message, {
        statusCode,
        path: req?.originalUrl,
        method: req?.method,
        error: details,
    });

    return res.status(statusCode).json({
        success: false,
        message,
        error: details,
    });
};

