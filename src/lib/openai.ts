import { OpenAI } from "openai";

// Only initialize if API key is present
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
