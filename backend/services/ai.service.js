// Placeholder AI Service - Replace with OpenAI/Groq API

export const analyzeResume = (resumeText) => {
  // Mock AI analysis
  return {
    score: 85,
    skills: ['JavaScript', 'React', 'Node.js'],
    match: 'Strong fullstack candidate',
    suggestions: ['Add AWS certs']
  };
};

export const recommendJobs = (userSkills, jobs) => {
  // Simple keyword matching mock
  return jobs.filter(job => 
    job.requirements.some(req => userSkills.some(skill => req.toLowerCase().includes(skill.toLowerCase())))
  ).slice(0, 5);
};
