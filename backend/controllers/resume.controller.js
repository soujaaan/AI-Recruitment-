import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import OpenAI from "openai";

// Parse Resume Route
export const parseResume = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const resume = await Resume.findOne({ userId });
    if (!resume) {
        throw new ApiError(404, "No resume found. Please upload a resume first.");
    }
    
    if (resume.parsedData) {
        return sendSuccess(res, 200, { parsedData: resume.parsedData }, "Resume already parsed");
    }

    try {
        // Fetch file from URL
        const fileResponse = await fetch(resume.fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to fetch resume file from storage: ${fileResponse.statusText}`);
        }
        
        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Extract text
        const pdfData = await pdf(buffer);
        const text = pdfData.text;

        if (!text || text.trim() === "") {
            throw new Error("Could not extract any text from the PDF");
        }

        // Call OpenAI
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const prompt = `
Extract structured JSON from this resume. Ensure the output is strictly valid JSON without any markdown formatting like \`\`\`json.
Required schema:
{
  "name": "string",
  "email": "string",
  "skills": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string"
    }
  ],
  "education": "string"
}

Resume Text:
${text}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Use gpt-4o-mini as specified in env config
            messages: [{ role: "user", content: prompt }]
        });

        const rawContent = completion.choices[0].message.content;
        let parsedData;
        try {
            // Remove markdown code blocks if present
            const cleanContent = rawContent.replace(/```json\n?|\n?```/gi, '').trim();
            parsedData = JSON.parse(cleanContent);
        } catch (jsonErr) {
            throw new Error("AI returned invalid JSON: " + rawContent);
        }

        // Save parsed data
        resume.parsedData = parsedData;
        await resume.save();

        return sendSuccess(res, 200, { parsedData }, "Resume parsed successfully");
    } catch (error) {
        console.error("Resume Parsing Error:", error);
        // Do not crash server, return 500 cleanly
        throw new ApiError(500, `Failed to parse resume: ${error.message}`);
    }
});
