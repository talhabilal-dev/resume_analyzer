import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canUpload = user.canUploadToday();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday =
      user.lastUploadDate &&
      new Date(user.lastUploadDate).setHours(0, 0, 0, 0) === today.getTime();

    return NextResponse.json({
      email: user.email,
      dailyLimit: user.dailyUploadLimit,
      uploadsToday: isToday ? user.uploadsToday : 0,
      canUpload,
      lastUploadDate: user.lastUploadDate,
      resetsAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
