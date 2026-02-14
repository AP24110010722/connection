import { GoogleGenerativeAI } from "@google/generative-ai";
import { PERSONAS } from "./constants";

// Use the server-side key (no NEXT_PUBLIC prefix)
const apiKey = process.env.GEMINI_API_KEY;

export async function generateHeartResponse(personalityId: string, userInput: string) {
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in environment variables");
    return "I'm having a little trouble connecting to my heart right now. (Server Config Error)";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Validate personality
  const persona = Object.values(PERSONAS).find(p => p.id === personalityId);
  if (!persona) return "I don't know who I am right now. ❤️";

  const model = genAI.getGenerativeModel({ 
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash", 
    systemInstruction: persona.instruction
  });

  try {
    const result = await model.generateContent(userInput);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "I'm listening, but I'm lost for words right now. ❤️";
  }
}