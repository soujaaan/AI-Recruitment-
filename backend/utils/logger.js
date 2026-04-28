const serializeMeta = (meta = {}) => {
    if (!meta || Object.keys(meta).length === 0) {
        return "";
    }

    return ` ${JSON.stringify(meta)}`;
};

const logWithLevel = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const suffix = serializeMeta(meta);
    const output = `[${timestamp}] ${level.toUpperCase()}: ${message}${suffix}`;

    if (level === "error") {
        console.error(output);
        return;
    }

    if (level === "warn") {
        console.warn(output);
        return;
    }

    console.info(output);
};

export const logger = {
    info: (message, meta) => logWithLevel("info", message, meta),
    warn: (message, meta) => logWithLevel("warn", message, meta),
    error: (message, meta) => logWithLevel("error", message, meta),
    http: (message, meta) => logWithLevel("info", message, meta),
};
