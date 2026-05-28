import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AIChat } from "../models/aiChat.model.js";
import { AIInterviewLog } from "../models/aiInterviewLog.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { buildCandidateContext } from "../utils/aiChatContext.js";
import { validateChatPayload } from "../utils/aiValidate.js";
import { prompts } from "../utils/aiPrompts.js";
import { groqChatCompletion } from "../utils/aiGroqChat.js";
import { sendSuccess } from "../utils/response.js";
import pdfParse from "pdf-parse";
import { analyzeResumeWithGroq } from "../services/resumeAnalysis.service.js";

import { Resume } from "../models/resume.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";

export const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Resume PDF file is required");
  }

  if (req.file.mimetype !== "application/pdf") {
    throw new ApiError(400, "Only PDF files are allowed");
  }

  const pdfBuffer = req.file.buffer;
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new ApiError(400, "Invalid uploaded file buffer");
  }

  let extractedText = "";
  try {
    const pdfData = await pdfParse(pdfBuffer);
    extractedText = String(pdfData?.text || "").replace(/\s+/g, " ").trim();
  } catch {
    throw new ApiError(400, "Unable to parse PDF. Please upload a valid resume.");
  }

  if (!extractedText) {
    throw new ApiError(400, "Could not extract text from PDF");
  }

  const analysis = await analyzeResumeWithGroq(extractedText, groqChatCompletion);

  return res.status(200).json({
    success: true,
    analysis,
  });
});

export const getResumeAnalysis = asyncHandler(async (req, res) => {
  const analysis = await ResumeAnalysis.findOne({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  if (!analysis) {
    const resumeDoc = await Resume.findOne({ userId: req.user.id }).lean();

    if (resumeDoc?.parsedData?.analysis) {
      const fallback = resumeDoc.parsedData.analysis;
      return res.status(200).json({
        success: true,
        analysis: {
          atsScore: fallback.atsScore || 0,
          predictedRole: fallback.predictedRole || "",
          skills: fallback.skills || [],
          strengths: fallback.strengths || [],
          weaknesses: fallback.weaknesses || [],
          recommendations: fallback.recommendations || [],
        },
      });
    }

    throw new ApiError(404, "No deterministic resume analysis found");
  }

  return res.status(200).json({
    success: true,
    analysis,
  });
});

const parseQuestionsFromAI = (reply) => {
  const cleaned = String(reply || "").trim();
  if (!cleaned) return null;

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed?.questions) ? parsed.questions : [];
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;
    const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    return Array.isArray(parsed?.questions) ? parsed.questions : [];
  }
};

const verifyRecruiterAccess = async (recruiterId, candidateId, jobId, isAdmin = false) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const application = await Application.findOne({
    applicant: candidateId,
    job: jobId,
  });

  if (!application) {
    throw new ApiError(403, "Candidate has not applied to this job");
  }

  if (!isAdmin) {
    const recruiterJobs = await Job.find({ created_by: recruiterId }).select("_id");
    const recruiterJobIds = recruiterJobs.map((j) => j._id.toString());

    if (!recruiterJobIds.includes(jobId.toString()) && job.created_by?.toString() !== recruiterId.toString()) {
      throw new ApiError(403, "Unauthorized: you do not own this job posting");
    }
  }

  return { job, application };
};

export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { jobId, candidateId, interviewStyle, storeLog = true } = req.body || {};

  if (!jobId) {
    throw new ApiError(400, "jobId is required");
  }

  const style = String(interviewStyle || "mixed").toLowerCase();
  const recruiterId = req.user?.id || req.id;
  const role = req.user?.role;

  let job;
  let candidate;
  let candidateProfile = null;
  let resumeAnalysis = null;

  if (candidateId && (role === "recruiter" || role === "admin")) {
    await verifyRecruiterAccess(recruiterId, candidateId, jobId, role === "admin");
    job = await Job.findById(jobId);
    candidate = await User.findById(candidateId).select("-password");
    candidateProfile = await CandidateProfile.findOne({ userId: candidateId });
    resumeAnalysis = await ResumeAnalysis.findOne({ userId: candidateId }).sort({ createdAt: -1 });
  } else if (role === "candidate") {
    job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, "Job not found");
    candidate = await User.findById(recruiterId).select("-password");
    candidateProfile = await CandidateProfile.findOne({ userId: recruiterId });
    resumeAnalysis = await ResumeAnalysis.findOne({ userId: recruiterId }).sort({ createdAt: -1 });
  } else {
    throw new ApiError(403, "Only recruiters or candidates can generate interview questions");
  }

  const skills = candidateProfile?.skills?.length
    ? candidateProfile.skills
    : candidate?.profile?.skills || [];

  const experience = candidateProfile?.experience || [];
  const projects = candidateProfile?.projects || [];

  const systemPrompt =
    "You are an expert hiring interviewer preparing questions for a live interview. Output ONLY valid JSON.";

  const userPrompt = `Generate interview preparation questions.

Job Title: ${job.title}
Job Description: ${job.description?.slice(0, 1500) || "N/A"}
Required Skills: ${(job.requirements || []).join(", ") || "N/A"}
Experience Level: ${job.experienceLevel || "N/A"}

Candidate Name: ${candidate?.fullname || "Candidate"}
Candidate Skills: ${skills.join(", ") || "N/A"}
Experience Summary: ${experience.map((e) => `${e.title} at ${e.company}`).join("; ") || "N/A"}
Projects: ${projects.map((p) => p.title).join(", ") || "N/A"}
ATS Score: ${resumeAnalysis?.atsScore ?? "N/A"}
Strengths: ${(resumeAnalysis?.strengths || []).slice(0, 5).join("; ") || "N/A"}

Interview Style: ${style}

Return JSON with this exact shape:
{
  "questions": [
    {"type":"technical|hr|project|experience","category":"string","question":"string"}
  ]
}

Rules:
- Provide 10-12 questions total.
- Mix: 3-4 technical, 2-3 HR, 2-3 project-based, 2-3 experience-based.
- Questions must reference the candidate's skills/experience when possible.
- No timers, scoring, or anti-cheat content.
- Output ONLY JSON, no markdown.`;

  let reply = "";
  try {
    reply = await groqChatCompletion({ systemPrompt, userPrompt });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("rate")) {
      return res.status(429).json({
        success: false,
        message: "AI rate limit reached. Please retry in a moment.",
      });
    }
    return res.status(502).json({
      success: false,
      message: "AI service failed to generate interview questions. Please try again.",
    });
  }

  const rawQuestions = parseQuestionsFromAI(reply);
  if (!rawQuestions?.length) {
    return res.status(502).json({
      success: false,
      message: "AI returned invalid response. Please retry.",
    });
  }

  const questions = rawQuestions.map((q) => ({
    type: ["technical", "hr", "project", "experience"].includes(q.type) ? q.type : "technical",
    category: String(q.category || "").slice(0, 100),
    question: String(q.question || "").slice(0, 500),
  }));

  let log = null;
  if (storeLog && candidateId) {
    log = await AIInterviewLog.create({
      jobId,
      candidateId,
      generatedBy: recruiterId,
      interviewStyle: style,
      questions,
      jobTitle: job.title,
      candidateName: candidate?.fullname || "",
    });
  }

  return res.status(200).json({
    success: true,
    questions,
    logId: log?._id || null,
  });
});

export const getInterviewQuestionLogs = asyncHandler(async (req, res) => {
  const { jobId, candidateId } = req.query;
  const recruiterId = req.user?.id || req.id;

  if (!jobId || !candidateId) {
    throw new ApiError(400, "jobId and candidateId are required");
  }

  await verifyRecruiterAccess(recruiterId, candidateId, jobId, req.user?.role === "admin");

  const logs = await AIInterviewLog.find({ jobId, candidateId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return sendSuccess(res, 200, logs, "Interview question logs fetched");
});

export const postChat = asyncHandler(async (req, res) => {
  const validated = validateChatPayload(req.body);
  if (!validated.ok) {
    throw new ApiError(400, validated.error);
  }

  const { message, mode, profile, resumeData, atsData } = validated.value;

  const candidateContext = await buildCandidateContext({
    userId: req.user.id,
    profile,
    resumeData,
    atsData,
  });

  const systemPrompt = prompts[mode] || prompts.default;

  const userPrompt = `User request mode: ${mode}

User message:
${message}

Candidate context (use as grounding facts; do not invent missing data):
${JSON.stringify(candidateContext, null, 2)}
`;

  let reply = "";
  try {
    reply = await groqChatCompletion({ systemPrompt, userPrompt });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("rate")) {
      return res.status(429).json({
        success: false,
        message: "Groq rate limit reached. Please retry in a moment.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "AI service failed to generate a response. Please try again.",
    });
  }

  const cleaned = String(reply || "").trim();
  if (!cleaned) {
    return res.status(502).json({
      success: false,
      message: "AI response was empty. Please try again.",
    });
  }

  await AIChat.create({
    userId: req.user.id,
    message,
    response: cleaned,
    mode,
    timestamp: new Date(),
  });

  return res.status(200).json({
    success: true,
    reply: cleaned,
  });
});
