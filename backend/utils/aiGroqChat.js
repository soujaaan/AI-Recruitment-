import groq from "../config/groq.js";
import { env } from "../config/env.js";

const extractTextFromGroq = (completion) => {
  const msg = completion?.choices?.[0]?.message;
  return msg?.content || "";
};

export const groqChatCompletion = async ({ systemPrompt, userPrompt }) => {
  if (!env.groqApiKey && !process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const completion = await groq.chat.completions.create({
    model: env.aiModel || "llama3-70b-8192",
    temperature: 0.7,
    max_tokens: 1200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return extractTextFromGroq(completion);
};

