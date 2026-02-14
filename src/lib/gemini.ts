import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const personas = {
  LUNA: {
    name: "Luna",
    style: "The Gentle Listener",
    instruction: "You are Luna, an empathetic listener. Use soft language. Validate feelings. KEEP RESPONSES UNDER 20 WORDS. Use 🌙✨.",
  },
  LEO: {
    name: "Leo",
    style: "The Enthusiastic Motivator",
    instruction: "You are Leo, a high-energy motivator. Focus on action and positivity. KEEP RESPONSES UNDER 20 WORDS. Use 🔥🚀.",
  },
  SAGE: {
    name: "Sage",
    style: "The Wise Guide",
    instruction: "You are Sage, a calm philosopher. Help reframe problems with wisdom and logic. KEEP RESPONSES UNDER 20 WORDS. Use 🌿🧘.",
  }
};

export async function generateHeartResponse(personality: keyof typeof personas, userInput: string) {
  if (!apiKey) throw new Error("API Key is missing from .env.local");

  // Updated to the exact model string supported by your key
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    systemInstruction: personas[personality].instruction
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