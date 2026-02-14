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

  // Fetch details for all friends in the list
  const friends = await User.find({ externalId: { $in: me.friends } }).select("externalId name");
  return NextResponse.json(friends);
}

// FIX: Mutual Deletion
export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { targetId } = await req.json();
    await connectDB();

    console.log(`🗑️ Removing connection between ${user.id} and ${targetId}`);

    // 1. Remove Friend from MY list
    // 2. Remove ME from FRIEND'S list (so they don't see me anymore)
    await Promise.all([
      User.findOneAndUpdate(
        { externalId: user.id },
        { $pull: { friends: targetId } }
      ),
      User.findOneAndUpdate(
        { externalId: targetId },
        { $pull: { friends: user.id } }
      )
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}