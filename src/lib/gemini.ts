import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const personas = {
  LUNA: {
    name: "Luna",
    style: "The Gentle Listener",
    instruction: "You are Luna, an empathetic listener. Use soft language. KEEP RESPONSES UNDER 20 WORDS. Use 🌙✨.",
  },
  LEO: {
    name: "Leo",
    style: "The Enthusiastic Motivator",
    instruction: "You are Leo, a high-energy motivator. Focus on action and positivity. KEEP RESPONSES UNDER 20 WORDS. Use 🔥🚀.",
  },
  SAGE: {
    name: "Sage",
    style: "The Wise Guide",
    instruction: "You are Sage, a calm philosopher. Help reframe problems with wisdom. KEEP RESPONSES UNDER 20 WORDS. Use 🌿🧘.",
  }
};

export async function generateHeartResponse(personality: keyof typeof personas, userInput: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", // Using flash for speed and lower cost
    systemInstruction: personas[personality].instruction
  });

  const result = await model.generateContent(userInput);
  return result.response.text();
}