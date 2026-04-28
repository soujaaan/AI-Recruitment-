import { logger } from "./logger.js";

export const requestLogger = (req, res, next) => {
    const startedAt = Date.now();

    res.on("finish", () => {
        logger.http(`${req.method} ${req.originalUrl}`, {
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            ip: req.ip,
        });
    });

    next();
};
