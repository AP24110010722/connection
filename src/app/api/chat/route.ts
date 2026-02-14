import { NextResponse } from "next/server";
import { generateHeartResponse, personas } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, personality } = await req.json();

    const aiResponse = await generateHeartResponse(personality as keyof typeof personas, message);

    // Ensure we return the JSON exactly as the frontend expects it
    return NextResponse.json({ text: aiResponse });
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error.message);
    return NextResponse.json({ text: "I'm having a moment of silence. Try again? ❤️" });
  }
}