import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { Application } from "../models/application.model.js";
import OpenAI from "openai";

export const calculateATS = asyncHandler(async (req, res) => {
    const { jobDescription, parsedData } = req.body;

    if (!jobDescription || !parsedData) {
        throw new ApiError(400, "Both jobDescription and parsedData are required");
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const prompt = `
Act as an ATS (Applicant Tracking System). Analyze the following resume against the job description and calculate an ATS match score.
Use the following weighting:
- Skill Match (40%)
- Experience Match (25%)
- Keyword Match (15%)
- Education (10%)
- Bonus (10%)

Job Description:
${jobDescription}

Parsed Resume Data:
${JSON.stringify(parsedData)}

Return strictly valid JSON in the following format (no markdown):
{
  "score": number, // out of 100
  "breakdown": {
    "skillMatch": number, // out of 40
    "experienceMatch": number, // out of 25
    "keywordMatch": number, // out of 15
    "education": number, // out of 10
    "bonus": number // out of 10
  },
  "feedback": "A short summary of why this score was given."
}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });

        const rawContent = completion.choices[0].message.content;
        let result;
        try {
            const cleanContent = rawContent.replace(/```json\n?|\n?```/gi, '').trim();
            result = JSON.parse(cleanContent);
        } catch (jsonErr) {
            throw new Error("AI returned invalid JSON: " + rawContent);
        }

        // Optional: Save to Application if applicationId is provided
        const { applicationId } = req.body;
        if (applicationId) {
            await Application.findByIdAndUpdate(applicationId, { atsScore: result.score });
        }

        return sendSuccess(res, 200, result, "ATS Score calculated successfully");
    } catch (error) {
        console.error("ATS Calculation Error:", error);
        throw new ApiError(500, `Failed to calculate ATS score: ${error.message}`);
    }
});
