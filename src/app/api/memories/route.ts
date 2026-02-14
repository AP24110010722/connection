import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Memory } from "@/lib/models";

export async function GET() {
  await connectDB();
  const memories = await Memory.find({}).sort({ _id: -1 });
  return NextResponse.json(memories);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newMem = await Memory.create(body);
  return NextResponse.json(newMem);
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Memory.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}