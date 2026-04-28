import { ApiError } from "../utils/apiError.js";
import { normalizeRole } from "../utils/role.utils.js";

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const role = req.user?.role;

        if (!role) {
            return next(new ApiError(401, "Authentication required"));
        }

        const normalizedRequiredRoles = roles.map(normalizeRole);
        if (!normalizedRequiredRoles.includes(role)) {
            return next(new ApiError(403, "Forbidden"));
        }

        next();
    };
};

export default authorizeRoles;

