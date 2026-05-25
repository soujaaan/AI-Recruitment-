import { ROLES, ROLE_ALIASES } from "../constants/roles.js";

/**
 * Role normalization utility
 * Maps legacy DB values to normalized internal values
 * Supports: candidate, recruiter, admin
 */
export const normalizeRole = (role) => {
    if (!role) return null;
    // Map any alias to the normalized role
    const normalized = ROLE_ALIASES[role] || role.toLowerCase();
    
    // Add fallback checks for user/jobseeker to candidate
    if (normalized === 'user' || normalized === 'jobseeker') {
        return ROLES.CANDIDATE;
    }
    
    return normalized;
};

export const isValidRole = (role) => {
    const normalized = normalizeRole(role);
    return Object.values(ROLES).includes(normalized);
};

export { ROLES };
