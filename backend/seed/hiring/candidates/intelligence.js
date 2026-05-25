import { randInt, pick, pickN } from "../../helpers.js";
import { CANDIDATE_BEHAVIORS } from "../config.js";

const SENIORITY_FROM_YEARS = (years) => {
    if (years <= 1) return "fresher";
    if (years <= 3) return "junior";
    if (years <= 6) return "mid";
    return "senior";
};

const inferExperienceYears = (profile, user) => {
    const exp = profile?.experience || [];
    if (exp.length) {
        const current = exp.find((e) => e.current);
        const start = current?.startDate || exp[0]?.startDate;
        if (start) {
            const y = parseInt(String(start).slice(0, 4), 10);
            if (!Number.isNaN(y)) return Math.max(0, 2026 - y);
        }
    }
    const bio = user?.profile?.bio || profile?.headline || "";
    const match = bio.match(/(\d+)\s*yrs?/i);
    if (match) return Number(match[1]);
    return randInt(0, 8);
};

/**
 * Derive candidate intelligence from existing foundation profiles (no DB mutation required).
 */
export const buildCandidateIntelligence = (candidates, profiles, resumes) => {
    const profileByUser = new Map(profiles.map((p) => [String(p.userId || p.candidateId), p]));
    const resumeByUser = new Map(resumes.map((r) => [String(r.userId || r.user), r]));

    const behaviorPool = [];
    for (const b of CANDIDATE_BEHAVIORS) {
        const n = Math.round(candidates.length * b.share);
        for (let i = 0; i < n; i++) behaviorPool.push(b);
    }
    while (behaviorPool.length < candidates.length) {
        behaviorPool.push(CANDIDATE_BEHAVIORS[1]);
    }

    return candidates.map((user, index) => {
        const profile = profileByUser.get(String(user._id)) || {};
        const resume = resumeByUser.get(String(user._id));
        const experienceYears = inferExperienceYears(profile, user);
        const behavior = behaviorPool[index] || CANDIDATE_BEHAVIORS[1];
        const targetApplications = randInt(behavior.minApps, behavior.maxApps);
        const skills = profile.skills || user.profile?.skills || [];
        const preferredRoles =
            user.profile?.preferredRoles ||
            pickN(
                ["Frontend Developer", "Backend Engineer", "Full Stack", "Data Analyst", "ML Engineer"],
                2
            );

        return {
            candidateId: user._id,
            profileId: profile._id,
            resumeId: resume?._id || profile.resume,
            fullName: profile.personalInfo?.fullName || user.fullname,
            skills,
            experienceYears,
            seniority: SENIORITY_FROM_YEARS(experienceYears),
            activityLevel: behavior.type,
            preferredRoles,
            skillCluster: inferSkillCluster(skills),
            preferredLocations: [
                profile.personalInfo?.location || user.profile?.location,
                pick(["Remote", "Hybrid"]),
            ].filter(Boolean),
            expectedSalary: inferExpectedSalary(experienceYears),
            targetApplications,
            profile,
            resume,
        };
    });
};

const inferSkillCluster = (skills) => {
    const s = skills.map((x) => x.toLowerCase()).join(" ");
    if (/react|vue|angular|frontend|css/.test(s)) return "frontend";
    if (/python|tensorflow|ml|nlp|pytorch/.test(s)) return "ai_ml";
    if (/node|java|spring|backend|api/.test(s)) return "backend";
    if (/sql|tableau|power bi|data/.test(s)) return "data";
    if (/aws|kubernetes|docker|devops/.test(s)) return "devops";
    return "general";
};

const inferExpectedSalary = (years) => {
    if (years <= 1) return { min: 45000, max: 70000 };
    if (years <= 3) return { min: 65000, max: 95000 };
    if (years <= 6) return { min: 90000, max: 130000 };
    return { min: 120000, max: 185000 };
};
