/**
 * Immutable application-time candidate snapshot for recruiters.
 */
export const buildApplicationSnapshot = (candidateIntel) => {
    const { profile, resume } = candidateIntel;
    const latestRole = profile?.experience?.[0];

    return {
        fullName: candidateIntel.fullName || profile?.personalInfo?.fullName || "",
        title: latestRole?.title || profile?.headline || "Software Professional",
        skills: candidateIntel.skills || profile?.skills || [],
        experience: profile?.experience || [],
        education: profile?.education || null,
        certifications: profile?.certifications || [],
        projects: profile?.projects || [],
        resumeUrl:
            profile?.resumePdfUrl ||
            resume?.fileUrl ||
            `https://cloudinary.com/resumes/${candidateIntel.candidateId}.pdf`,
    };
};
