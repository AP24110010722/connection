import { GoogleGenerativeAI } from "@google/generative-ai";
import { PERSONAS } from "./constants";

export async function generateHeartResponse(personalityId: string, userInput: string) {
  // ROBUST FIX: Check for both variable names
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in .env.local");
    return "I'm having a little trouble connecting to my heart right now. (Server Config Error)";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Validate personality
  const persona = Object.values(PERSONAS).find(p => p.id === personalityId);
  if (!persona) return "I don't know who I am right now. ❤️";

  // Use the model from env, or default to the one we know works
  const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
  
  const model = genAI.getGenerativeModel({ 
    model: modelName, 
    systemInstruction: persona.instruction
  });

  try {
    const result = await model.generateContent(userInput);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return "I'm listening, but I'm lost for words right now. (API Error) ❤️";
  }
}