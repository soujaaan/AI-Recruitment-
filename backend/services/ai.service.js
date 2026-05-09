<<<<<<< HEAD
// NOTE: This module must NOT contain any ATS scoring / resume evaluation logic.
// ATS must be deterministic-only and originate solely from:
// backend/ai/app.py -> /analyze -> ats_scorer.pkl

// Chatbot / conversational features that are NOT ATS-related should live here.
// (This file currently contains only job recommendation helpers.)
=======
//import OpenAI from "openai";
//import { env } from "../config/env.js";

//const openai = new OpenAI({
    //apiKey: env.OPENAI_API_KEY,
//});

const extractResumePrompt = `
Extract structured candidate information from the following resume.

Return ONLY valid JSON. No markdown. No explanations.

Schema:
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ],
  "education": [],
  "certifications": []
}

Rules:
* If data is missing, return empty string or empty array
* Do NOT guess information
* Do NOT add extra fields

Resume Text:
{{resumeText}}
`;

const atsScorePrompt = `
Evaluate this candidate resume for ATS quality.

Criteria: Skills relevance, Experience depth, Project quality, Resume clarity

Return ONLY JSON:
{
  "score": number (0-100),
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:
* Suggestions must be actionable
* Do NOT repeat same point
* Max 5 items per array

Candidate Data:
{{structured_json}}
`;

export const extractStructuredResume = async (resumeText) => {
    if (!env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY not configured");
    }

    const prompt = extractResumePrompt.replace("{{resumeText}}", resumeText);
    
    let attempts = 0;
    while (attempts < 2) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content;
            const cleanContent = content.replace(/```json\n?|\n?```/gi, '').trim();
            const data = JSON.parse(cleanContent);
            return data;
        } catch (error) {
            attempts++;
            if (attempts >= 2) {
                throw new Error("AI parsing failed after retries: " + error.message);
            }
        }
    }
};

export const generateATSScore = async (extractedData) => {
    if (!env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY not configured");
    }

    const jsonData = JSON.stringify(extractedData, null, 2);
    const prompt = atsScorePrompt.replace("{{structured_json}}", jsonData);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|\n?```/gi, '').trim();
    const data = JSON.parse(cleanContent);
    return data;
};

// Existing mocks (keep for compatibility)
export const analyzeResume = (resumeText) => {
  return {
    score: 85,
    skills: ['JavaScript', 'React', 'Node.js'],
    match: 'Strong fullstack candidate',
    suggestions: ['Add AWS certs']
  };
};
>>>>>>> a2a1630462db9c21ec94cc9d951bf008b1c94111

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


