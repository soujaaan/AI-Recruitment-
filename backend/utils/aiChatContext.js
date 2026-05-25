import { CandidateProfile } from "../models/candidateProfile.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

const safeArray = (v) => (Array.isArray(v) ? v : []);

const pickProfile = (profile) => {
  if (!profile) return null;
  return {
    personalInfo: profile.personalInfo || {},
    summary: profile.summary || "",
    skills: safeArray(profile.skills),
    experience: safeArray(profile.experience),
    projects: safeArray(profile.projects),
    education: profile.education || {},
    completionPercentage: profile.completionPercentage ?? 0,
  };
};

export const buildCandidateContext = async ({ userId, resumeData, atsData, profile, appliedJobs } = {}) => {
  const [profileDoc, atsDoc, apps] = await Promise.all([
    profile || CandidateProfile.findOne({ userId }).lean(),
    atsData || ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    appliedJobs
      ? Promise.resolve(appliedJobs)
      : Application.find({ applicant: userId })
          .populate("job")
          .lean(),
  ]);

  const parsedApps = apps || [];
  const jobs = parsedApps
    .map((a) => a.job)
    .filter(Boolean);

  const applied = jobs.map((j) => ({
    id: j._id?.toString?.() || j.id,
    title: j?.title || "",
    company: j?.companyId?.name || j?.companyId || "",
    requirements: safeArray(j?.requirements),
    atsTarget: j?.atsTarget || undefined,
  }));

  return {
    skills: atsDoc?.skills || profileDoc?.skills || [],
    education: profileDoc?.education || {},
    projects: profileDoc?.projects || [],
    experience: profileDoc?.experience || [],
    atsScore: atsDoc?.atsScore ?? 0,
    predictedRole: atsDoc?.predictedRole ?? "",
    appliedJobs: applied,
    profile: pickProfile(profileDoc),
    resumeAnalysis: atsDoc || null,
    raw: {
      // keep for future expansion
      appsCount: parsedApps.length,
    },
  };
};

