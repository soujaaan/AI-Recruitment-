export const sendSuccess = (res, statusCode, data, message = "Success", extras = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...extras,
    });
};
