/**
 * Compare candidate skills against job requiredSkills / requirements.
 */

export const normalizeSkill = (skill) =>
    String(skill || "")
        .trim()
        .toLowerCase();

const skillsMatch = (candidateSkill, requiredSkill) => {
    const a = normalizeSkill(candidateSkill);
    const b = normalizeSkill(requiredSkill);
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
};

export const collectCandidateSkills = ({ profile, userProfile, resumeAnalysis } = {}) => {
    const skills = [];
    if (Array.isArray(profile?.skills)) skills.push(...profile.skills);
    if (Array.isArray(userProfile?.skills)) skills.push(...userProfile.skills);
    if (Array.isArray(resumeAnalysis?.skills)) skills.push(...resumeAnalysis.skills);
    (profile?.experience || []).forEach((exp) => {
        if (Array.isArray(exp?.skills)) skills.push(...exp.skills);
    });
    (profile?.projects || []).forEach((proj) => {
        if (Array.isArray(proj?.skills)) skills.push(...proj.skills);
    });
    return skills.filter(Boolean);
};

/**
 * @param {string[]} candidateSkills
 * @param {string[]} requiredSkills - from job.requirements
 */
export const calculateSkillMatch = (candidateSkills = [], requiredSkills = []) => {
    const required = [
        ...new Set(
            requiredSkills
                .map((s) => String(s).trim())
                .filter(Boolean)
        ),
    ];

    if (required.length === 0) {
        return { matchScore: 100, matchedSkills: [], missingSkills: [] };
    }

    const candidateNormalized = [
        ...new Set(
            candidateSkills
                .map((s) => String(s).trim())
                .filter(Boolean)
        ),
    ];

    const matchedSkills = [];
    const missingSkills = [];

    for (const req of required) {
        const found = candidateNormalized.some((cs) => skillsMatch(cs, req));
        if (found) matchedSkills.push(req);
        else missingSkills.push(req);
    }

    const matchScore = Math.round((matchedSkills.length / required.length) * 100);
    return { matchScore, matchedSkills, missingSkills };
};
