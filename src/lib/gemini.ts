import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const personas = {
  LUNA: {
    name: "Luna",
    style: "The Gentle Listener",
    instruction: "You are Luna, an empathetic listener. Use soft, comforting language. Validate feelings. No advice unless asked. Use 🌙✨.",
  },
  LEO: {
    name: "Leo",
    style: "The Enthusiastic Motivator",
    instruction: "You are Leo, a high-energy cheerleader. Focus on action, small wins, and positivity. Use 🔥🚀.",
  },
  SAGE: {
    name: "Sage",
    style: "The Wise Guide",
    instruction: "You are Sage, a calm philosopher. Help users reframe problems with wisdom and logic. Use 🌿🧘.",
  }
};

export async function generateHeartResponse(personality: keyof typeof personas, userInput: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: personas[personality].instruction
  });

  const result = await model.generateContent(userInput);
  return result.response.text();
}