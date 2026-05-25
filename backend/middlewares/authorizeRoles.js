import { ApiError } from "../utils/apiError.js";
import { normalizeRole } from "../utils/role.utils.js";
import { ROLES } from "../constants/roles.js";
import { logger } from "../utils/logger.js";

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Handle undefined user gracefully
        if (!req.user) {
            logger.error("[AuthorizeRoles] req.user is missing");
            return next(new ApiError(401, "Authentication required"));
        }

        const userRole = normalizeRole(req.user.role);

        if (!userRole) {
            logger.error("[AuthorizeRoles] Role is missing on req.user");
            return next(new ApiError(401, "Role is missing. Authentication required"));
        }

        const normalizedRequiredRoles = roles.map(normalizeRole);
        
        logger.info(`[AuthorizeRoles] User Role: ${userRole} | Required: ${normalizedRequiredRoles.join(", ")}`);

        if (!normalizedRequiredRoles.includes(userRole)) {
            logger.warn(`[AuthorizeRoles] Access denied. User Role: ${userRole} | Required: ${normalizedRequiredRoles.join(", ")}`);
            return next(new ApiError(403, `Forbidden. Only ${normalizedRequiredRoles.join(" or ")}s can perform this action.`));
        }

        next();
    };
};

export default authorizeRoles;
