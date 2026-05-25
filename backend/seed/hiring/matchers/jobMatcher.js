import { calculateSkillMatch } from "../../../utils/skillMatch.util.js";

const normalize = (s) => String(s || "").toLowerCase();

const roleMatches = (preferredRoles, jobTitle) => {
    const title = normalize(jobTitle);
    return preferredRoles.some((role) => {
        const r = normalize(role);
        return title.includes(r.split(" ")[0]) || r.includes(title.split(" ")[0]);
    });
};

const salaryCompatible = (expected, job) => {
    const jobMin = job.salaryRange?.min || 0;
    const jobMax = job.salaryRange?.max || jobMin + 50000;
    if (!expected?.min) return true;
    return expected.max >= jobMin * 0.85 && expected.min <= jobMax * 1.15;
};

const experienceCompatible = (candidateYears, job) => {
    const level = normalize(job.experienceLevel || "");
    if (level.includes("junior") || level.includes("entry")) return candidateYears <= 4;
    if (level.includes("mid")) return candidateYears >= 1 && candidateYears <= 8;
    if (level.includes("senior") || level.includes("director")) return candidateYears >= 3;
    return true;
};

/**
 * Score how well a candidate fits a job (higher = better match for application priority).
 */
export const scoreJobFit = (candidateIntel, job) => {
    const requiredSkills = job.skillsRequired?.length
        ? job.skillsRequired
        : job.requiredSkills || job.requirements || [];

    const { matchScore, matchedSkills, missingSkills } = calculateSkillMatch(
        candidateIntel.skills,
        requiredSkills
    );

    let score = matchScore;
    if (roleMatches(candidateIntel.preferredRoles, job.title)) score += 12;
    if (salaryCompatible(candidateIntel.expectedSalary, job)) score += 8;
    if (experienceCompatible(candidateIntel.experienceYears, job)) score += 10;

    const loc = normalize(job.location);
    if (candidateIntel.preferredLocations.some((l) => normalize(l).includes(loc) || loc.includes("remote"))) {
        score += 5;
    }

    if (candidateIntel.skillCluster === "ai_ml" && normalize(job.title).includes("ml")) score += 8;
    if (candidateIntel.skillCluster === "frontend" && normalize(job.title).includes("react")) score += 8;

    return {
        score: Math.min(100, score),
        matchScore,
        matchedSkills,
        missingSkills,
        eligible: matchScore >= 18 || roleMatches(candidateIntel.preferredRoles, job.title),
    };
};

/**
 * Rank open jobs for a candidate; returns top N eligible jobs sorted by fit.
 */
export const findEligibleJobs = (candidateIntel, jobs, limit = 80) => {
    const scored = [];
    for (const job of jobs) {
        if (job.isActive === false || job.status === "closed") continue;
        const fit = scoreJobFit(candidateIntel, job);
        if (!fit.eligible) continue;
        scored.push({ job, ...fit });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
};
