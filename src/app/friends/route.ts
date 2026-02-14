import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOne({ externalId: user.id });
  if (!me || !me.friends) return NextResponse.json([]);

  const friends = await User.find({ externalId: { $in: me.friends } }).select("externalId name");
  return NextResponse.json(friends);
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { targetId } = await req.json();
    await connectDB();

    await User.findOneAndUpdate(
      { externalId: user.id },
      { $pull: { friends: targetId } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}