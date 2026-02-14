import { NextResponse } from "next/server";
import { generateHeartResponse, personas } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, personality } = await req.json();

    // Check if personality exists in our library
    if (!message || !personality || !personas[personality as keyof typeof personas]) {
      return NextResponse.json({ text: "I'm not sure who I am right now. ❤️" }, { status: 400 });
    }

    const aiResponse = await generateHeartResponse(personality as keyof typeof personas, message);
    
    // Ensure we send back a string, not an empty response
    return NextResponse.json({ text: aiResponse.trim() || "I'm listening. Tell me more." });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If the API fails (e.g., bad key), we provide a helpful fallback
    return NextResponse.json({ 
      text: "My connection is a bit weak, but I'm still here for you. ❤️" 
    });
  }
}