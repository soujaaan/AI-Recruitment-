/**
 * Normalize MongoDB ObjectId values from API/Redux into a 24-char hex string.
 */
export const toMongoIdString = (value) => {
    if (value == null) return "";

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "object") {
        if (typeof value.$oid === "string") {
            return value.$oid.trim();
        }
        if (value._id != null) {
            return toMongoIdString(value._id);
        }
        if (typeof value.toString === "function") {
            const serialized = value.toString();
            if (serialized && serialized !== "[object Object]") {
                return serialized.trim();
            }
        }
    }

    return String(value).trim();
};

export const isValidMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(toMongoIdString(value));
