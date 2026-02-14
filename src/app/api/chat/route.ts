import { NextResponse } from "next/server";
import { generateHeartResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, personality } = await req.json();

    if (!message || !personality) {
      return NextResponse.json({ text: "Please say something first. ❤️" }, { status: 400 });
    }

    const aiResponse = await generateHeartResponse(personality, message);

    return NextResponse.json({ text: aiResponse });
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error.message);
    return NextResponse.json({ text: "I'm having a moment of silence. Try again? ❤️" }, { status: 500 });
  }
}