import { INDUSTRY_JOB_PROFILES } from "../config.js";

export const resolveIndustryProfile = (industry) => {
    const key = Object.keys(INDUSTRY_JOB_PROFILES).find(
        (k) => k !== "default" && industry?.toLowerCase().includes(k.toLowerCase())
    );
    return INDUSTRY_JOB_PROFILES[key] || INDUSTRY_JOB_PROFILES[industry] || INDUSTRY_JOB_PROFILES.default;
};

export const rolesForRecruiterTier = (profile, tier) => {
    const roles = profile.roles || INDUSTRY_JOB_PROFILES.default.roles;
    if (tier === "aggressive") return roles;
    if (tier === "medium") return roles.slice(0, Math.max(2, roles.length));
    return roles.slice(0, Math.max(1, Math.min(3, roles.length)));
};
