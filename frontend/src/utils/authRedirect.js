import { normalizeRole } from "@/lib/normalize";

export const getDashboardPath = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === "recruiter" || normalized === "admin") {
        return "/dashboard/recruiter";
    }
    return "/dashboard/candidate";
};
