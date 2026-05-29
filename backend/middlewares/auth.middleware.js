import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { normalizeRole } from "../utils/role.utils.js";

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }
    return req.cookies?.token || null;
};

const isAuthenticated = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return next(new ApiError(401, "Authentication required"));
        }

        if (!env.jwtSecret) {
            return next(new ApiError(500, "JWT secret is not configured"));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, env.jwtSecret);
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                return next(new ApiError(401, "Token expired"));
            }
            return next(new ApiError(401, "Invalid token"));
        }

        const userId = decoded.userId || decoded.id || decoded.sub;
        if (!userId) {
            return next(new ApiError(401, "Invalid token payload"));
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return next(new ApiError(401, "User no longer exists"));
        }

        if (user.isActive === false) {
            return next(new ApiError(403, "Account is deactivated"));
        }

        const normalizedRole = normalizeRole(user.role);

        req.user = {
            id: user._id.toString(),
            role: normalizedRole,
            email: user.email,
            fullname: user.fullname,
        };
        req.id = req.user.id;

        next();
    } catch (error) {
        next(new ApiError(500, "Authentication verification failed"));
    }
};

export const protectRoute = isAuthenticated;
export default isAuthenticated;

