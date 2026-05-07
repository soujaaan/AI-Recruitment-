import Groq from "groq-sdk";
import { env } from "./env.js";

const groq = new Groq({
  apiKey: env.groqApiKey || process.env.GROQ_API_KEY,
});

export default groq;
