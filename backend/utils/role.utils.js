/**
 * Role normalization utility
 * Maps legacy DB values to normalized internal values
 * Supports: candidate, recruiter, admin
 */

const ROLE_MAP = {
    candidate: "candidate",
    student: "candidate",
    Candidate: "candidate",
    CANDIDATE: "candidate",
    recruiter: "recruiter",
    RECRUITER: "recruiter",
    admin: "admin",
    ADMIN: "admin",
};

export const normalizeRole = (role) => {
    if (!role) return null;
    return ROLE_MAP[role] || role.toLowerCase();
};

export const isValidRole = (role) => {
    const normalized = normalizeRole(role);
    return ["candidate", "recruiter", "admin"].includes(normalized);
};

export const ROLES = {
    CANDIDATE: "candidate",
    RECRUITER: "recruiter",
    ADMIN: "admin",
};

