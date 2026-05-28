import fs from "fs";
import path from "path";

import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

// Calls local Flask deterministic ML server.
// The Flask server is expected at: http://localhost:5000
const getFlaskBaseUrl = () => {
  return process.env.FLASK_AI_BASE_URL || env.flaskAiBaseUrl || "http://localhost:5000";
};

const extractPdfText = async (resumePathOrUrl) => {
  // Current architecture stores resumes as Cloudinary URLs in user.profile.resume.
  // For deterministic ATS inference, we support local filesystem paths too.
  // If URL is used, we fetch it.
  let buffer;

  if (typeof resumePathOrUrl === "string" && resumePathOrUrl.startsWith("http")) {
    const resp = await fetch(resumePathOrUrl);
    if (!resp.ok) {
      throw new ApiError(400, `Failed to fetch resume from url: ${resp.statusText}`);
    }
    const arr = await resp.arrayBuffer();
    buffer = Buffer.from(arr);
  } else {
    const filePath = path.resolve(resumePathOrUrl);
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, "Local resume file not found");
    }
    buffer = fs.readFileSync(filePath);
  }

  const pdfModule = await import("pdf-parse");
  const pdf = pdfModule.default;
  const parsed = await pdf(buffer);
  const text = parsed?.text || "";
  if (!text.trim()) {
    throw new ApiError(400, "Could not extract text from PDF (empty/corrupt). ");
  }
  return text;
};

const callFlaskAnalyze = async (resumeText) => {
  const url = `${getFlaskBaseUrl()}/analyze`;

  console.log("Calling Flask ATS:", url);
  console.log("ResumeText length:", resumeText?.length);

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resumeText }),
  });


  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    console.error("Flask ATS non-OK:", resp.status, txt);
    throw new ApiError(500, `ML inference failed: ${resp.status} ${txt}`);
  }


  const data = await resp.json();
  console.log("Flask ATS response:", data);
  if (data?.error) {
    throw new ApiError(500, `ML inference error: ${data.error}`);
  }
  return data;
};


export const aiAnalyzeResume = async (resumeText, opts = {}) => {
  // opts can include precomputed text; kept for future extensibility
  return callFlaskAnalyze(resumeText);
};

export const analyzeResumeFromStoredFile = async (storedResumeUrlOrPath) => {
  const text = await extractPdfText(storedResumeUrlOrPath);
  return callFlaskAnalyze(text);
};

const normalizeAnalysis = (parsed = {}) => {
  const toStringArray = (value) =>
    Array.isArray(value)
      ? value.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

  const score = Number(parsed?.atsScore);
  return {
    atsScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
    technicalSkills: toStringArray(parsed?.technicalSkills),
    missingKeywords: toStringArray(parsed?.missingKeywords),
    strengths: toStringArray(parsed?.strengths),
    weaknesses: toStringArray(parsed?.weaknesses),
    suggestions: toStringArray(parsed?.suggestions),
  };
};

const cleanGroqJson = (rawText = "") => {
  const text = String(rawText || "").trim();
  if (!text) {
    throw new ApiError(502, "AI returned an empty response");
  }

  const withoutCodeFence = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = withoutCodeFence.indexOf("{");
  const lastBrace = withoutCodeFence.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new ApiError(502, "AI returned malformed JSON");
  }

  return withoutCodeFence.slice(firstBrace, lastBrace + 1);
};

export const analyzeResumeWithGroq = async (resumeText, groqChatCompletion) => {
  if (!resumeText || !String(resumeText).trim()) {
    throw new ApiError(400, "Resume text is required for analysis");
  }

  const systemPrompt =
    "You are an ATS resume reviewer. Return ONLY valid JSON with keys: atsScore, technicalSkills, missingKeywords, strengths, weaknesses, suggestions.";
  const userPrompt = `Analyze this resume and return ONLY valid JSON.

Return:
- ATS score
- technical skills
- missing keywords
- strengths
- weaknesses
- suggestions

Resume:
${resumeText}`;

  let reply = "";
  try {
    reply = await groqChatCompletion({ systemPrompt, userPrompt });
  } catch (error) {
    if (String(error?.message || "").toLowerCase().includes("rate")) {
      throw new ApiError(429, "Groq rate limit reached. Please retry in a moment.");
    }
    throw new ApiError(502, "AI service failed to analyze the resume.");
  }

  try {
    const jsonPayload = cleanGroqJson(reply);
    const parsed = JSON.parse(jsonPayload);
    return normalizeAnalysis(parsed);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(502, "AI returned invalid JSON format.");
  }
};

