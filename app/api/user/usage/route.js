import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import CreditTransaction from "@/app/models/CreditTransaction";
import { CREDITS_PER_ANALYSIS } from "@/app/models/User";

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

    // Last 10 transactions for the history panel
    const recentTransactions = await CreditTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      email: user.email,
      credits: user.credits,
      creditsPerAnalysis: CREDITS_PER_ANALYSIS,
      analysesRemaining: Math.floor(user.credits / CREDITS_PER_ANALYSIS),
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
