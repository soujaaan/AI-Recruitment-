import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { normalizeRole } from "../utils/role.utils.js";

const getTokenFromRequest = (req) => req.cookies?.token || null;

/**
 * Attaches req.user when a valid token is present; never rejects unauthenticated requests.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token || !env.jwtSecret) {
            return next();
        }

        let decoded;
        try {
            decoded = jwt.verify(token, env.jwtSecret);
        } catch {
            return next();
        }

        const userId = decoded.userId || decoded.id || decoded.sub;
        if (!userId) {
            return next();
        }

        const user = await User.findById(userId).select("-password");
        if (!user || user.isActive === false) {
            return next();
        }

        req.user = {
            id: user._id.toString(),
            role: normalizeRole(user.role),
            email: user.email,
            fullname: user.fullname,
        };
        req.id = req.user.id;
        next();
    } catch {
        next();
    }
};

export default optionalAuth;
