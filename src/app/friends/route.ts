import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const me = await User.findOne({ externalId: user.id });
    
    // If user has no friends array yet, return empty
    if (!me || !me.friends) return NextResponse.json([]);

    // Get friend details
    const friends = await User.find({ externalId: { $in: me.friends } }).select("externalId name");
    return NextResponse.json(friends);
  } catch (err) {
    console.error("API GET Error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { targetId } = await req.json();
    console.log(`🗑️ API: Removing friend ${targetId} for user ${user.id}`);

    await connectDB();

    const result = await User.findOneAndUpdate(
      { externalId: user.id },
      { $pull: { friends: targetId } },
      { new: true }
    );

    console.log("✅ API: Friend Removed. Remaining:", result.friends);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ API DELETE Error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}