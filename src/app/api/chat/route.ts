import { NextResponse } from "next/server";
import { generateHeartResponse, personas } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, personality } = await req.json();

    if (!message || !personality || !personas[personality as keyof typeof personas]) {
      return NextResponse.json({ error: "Missing message or valid personality" }, { status: 400 });
    }

    const aiResponse = await generateHeartResponse(personality as keyof typeof personas, message);

    return NextResponse.json({ text: aiResponse });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to connect to the heart." }, { status: 500 });
  }
}