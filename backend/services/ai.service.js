// NOTE: This module must NOT contain any ATS scoring / resume evaluation logic.
// ATS must be deterministic-only and originate solely from:
// backend/ai/app.py -> /analyze -> ats_scorer.pkl

// Chatbot / conversational features that are NOT ATS-related should live here.
// (This file currently contains only job recommendation helpers.)

export const recommendJobs = (userSkills, jobs) => {
  return jobs
    .filter((job) =>
      job.requirements?.some((req) =>
        userSkills?.some((skill) =>
          String(req).toLowerCase().includes(String(skill).toLowerCase())
        )
      )
    )
    .slice(0, 5);
};


