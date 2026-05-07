import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

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

  const parsed = await pdf(buffer);
  const text = parsed?.text || "";
  if (!text.trim()) {
    throw new ApiError(400, "Could not extract text from PDF (empty/corrupt). ");
  }
  return text;
};

const callFlaskAnalyze = async (resumeText) => {
const url = `${getFlaskBaseUrl()}/analyze`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resumeText }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new ApiError(500, `ML inference failed: ${resp.status} ${txt}`);
  }

  const data = await resp.json();
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

