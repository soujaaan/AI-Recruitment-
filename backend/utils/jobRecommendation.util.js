import { CandidateProfile } from "../models/candidateProfile.model.js";
import { User } from "../models/user.model.js";
import {
    calculateSkillMatch,
    collectCandidateSkills,
    normalizeSkill,
} from "./skillMatch.util.js";

const WEIGHTS = {
    skills: 0.5,
    role: 0.25,
    experience: 0.15,
    location: 0.1,
};

const MAX_JOBS_FOR_SCORING = 400;

export { MAX_JOBS_FOR_SCORING };

const tokenize = (text = "") =>
    String(text)
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1);

const tokensOverlap = (aTokens, bTokens) => {
    if (!aTokens.length || !bTokens.length) return 0;
    const bSet = new Set(bTokens);
    const matches = aTokens.filter((t) => bSet.has(t) || [...bSet].some((b) => t.includes(b) || b.includes(t)));
    return matches.length / Math.max(aTokens.length, bTokens.length);
};

const getJobRequiredSkills = (job) => {
    const skills = [
        ...(job.requiredSkills || []),
        ...(job.skillsRequired || []),
        ...(job.requirements || []),
    ];
    return [...new Set(skills.map((s) => String(s).trim()).filter(Boolean))];
};

const scoreRoleMatch = (job, context) => {
    const titleTokens = tokenize(job.title);
    const descTokens = tokenize(job.description?.slice(0, 500));
    const jobTokens = [...new Set([...titleTokens, ...descTokens])];

    const roleSources = [
        context.preferredRole,
        context.headline,
        ...(context.recommendationTags || []),
        ...(context.experienceTitles || []),
        ...(context.resumeKeywords || []),
    ]
        .filter(Boolean)
        .flatMap((s) => (Array.isArray(s) ? s : tokenize(s)));

    if (!roleSources.length) {
        const category = job.aiMetadata?.category || "";
        return category ? tokensOverlap(tokenize(category), jobTokens) * 100 : 40;
    }

    const categoryTokens = tokenize(job.aiMetadata?.category || "");
    const combined = [...new Set([...roleSources, ...categoryTokens])];
    return Math.round(tokensOverlap(combined, jobTokens) * 100);
};

const normalizeExperience = (value = "") => {
    const v = String(value).toLowerCase();
    if (/entry|0-1|fresher|junior/i.test(v)) return "entry";
    if (/mid|1-3|2-4/i.test(v)) return "mid";
    if (/senior|5\+|5-|lead|principal/i.test(v)) return "senior";
    if (/director|executive|head/i.test(v)) return "lead";
    return v;
};

const scoreExperienceMatch = (job, context) => {
    const jobLevel = normalizeExperience(job.experienceLevel || job.experienceRequired);
    const candidateLevel = normalizeExperience(
        context.experienceLevel || context.preferredExperience || ""
    );

    if (!candidateLevel) {
        const years = Number(context.yearsOfExperience);
        if (Number.isFinite(years)) {
            if (years <= 1 && jobLevel === "entry") return 100;
            if (years <= 4 && jobLevel === "mid") return 100;
            if (years > 4 && (jobLevel === "senior" || jobLevel === "lead")) return 100;
        }
        return 50;
    }

    if (jobLevel === candidateLevel) return 100;
    if (
        (jobLevel === "mid" && candidateLevel === "entry") ||
        (jobLevel === "senior" && candidateLevel === "mid")
    ) {
        return 70;
    }
    if (jobLevel === "entry" && candidateLevel === "senior") return 30;
    return 40;
};

const scoreLocationMatch = (job, context) => {
    const jobLoc = normalizeSkill(job.location);
    const candidateLoc = normalizeSkill(
        context.location || context.preferences?.location || ""
    );

    if (!candidateLoc) return 50;
    if (!jobLoc) return 40;

    if (jobLoc === candidateLoc) return 100;
    if (jobLoc.includes("remote") || candidateLoc.includes("remote")) return 85;
    if (jobLoc.includes(candidateLoc) || candidateLoc.includes(jobLoc)) return 75;

    const jobParts = jobLoc.split(/[,\s]+/).filter(Boolean);
    const candParts = candidateLoc.split(/[,\s]+/).filter(Boolean);
    const overlap = jobParts.some((p) => candParts.includes(p));
    return overlap ? 65 : 25;
};

export const scoreJobForCandidate = (job, context) => {
    const requiredSkills = getJobRequiredSkills(job);
    const candidateSkills = context.skills || [];
    const { matchScore: skillMatchScore } = calculateSkillMatch(candidateSkills, requiredSkills);

    const roleScore = scoreRoleMatch(job, context);
    const experienceScore = scoreExperienceMatch(job, context);
    const locationScore = scoreLocationMatch(job, context);

    const matchScore = Math.round(
        skillMatchScore * WEIGHTS.skills +
            roleScore * WEIGHTS.role +
            experienceScore * WEIGHTS.experience +
            locationScore * WEIGHTS.location
    );

    const matchPercent = Math.min(100, Math.max(0, matchScore));
    const isBestMatch = matchPercent >= 80;
    const isAiMatched = matchPercent >= 50;

    return {
        matchScore,
        matchPercent,
        isBestMatch,
        isAiMatched,
        recommendationLabel: isBestMatch ? "Best Match" : isAiMatched ? "AI Matched" : null,
    };
};

export const rankJobsForCandidate = (jobs, context) =>
    jobs
        .map((job) => {
            const scoring = scoreJobForCandidate(job, context);
            return {
                ...job,
                ...scoring,
            };
        })
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

export const buildCandidateContext = async (userId) => {
    const [user, profile] = await Promise.all([
        User.findById(userId).select("profile fullname").lean(),
        CandidateProfile.findOne({ userId }).lean(),
    ]);

    const embeddedProfile =
        user?.profile && typeof user.profile === "object" && !user.profile._id
            ? user.profile
            : {};

    const skills = collectCandidateSkills({
        profile,
        userProfile: embeddedProfile,
    });

    const experienceTitles = (profile?.experience || embeddedProfile?.experience || [])
        .map((e) => e?.title)
        .filter(Boolean);

    const yearsOfExperience = (profile?.experience || []).reduce((total, exp) => {
        if (!exp?.startDate) return total;
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
        if (Number.isNaN(start.getTime())) return total;
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        return total + Math.max(0, years);
    }, 0);

    const resumeKeywords = [
        profile?.summary,
        profile?.bio,
        profile?.headline,
        embeddedProfile?.bio,
        ...(profile?.recommendationTags || []),
    ]
        .filter(Boolean)
        .join(" ");

    return {
        skills,
        headline: profile?.headline || embeddedProfile?.headline || "",
        preferredRole:
            profile?.preferences?.role ||
            profile?.preferences?.preferredRole ||
            profile?.headline ||
            "",
        location: profile?.personalInfo?.location || embeddedProfile?.location || "",
        preferences: profile?.preferences || {},
        recommendationTags: profile?.recommendationTags || [],
        experienceTitles,
        yearsOfExperience: Math.round(yearsOfExperience * 10) / 10,
        experienceLevel:
            profile?.preferences?.experienceLevel ||
            (yearsOfExperience <= 1 ? "Entry Level" : yearsOfExperience <= 4 ? "Mid Level" : "Senior Level"),
        resumeKeywords: tokenize(resumeKeywords),
    };
};
