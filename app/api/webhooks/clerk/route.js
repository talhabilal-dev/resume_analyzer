import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User, { INITIAL_CREDITS } from "@/app/models/User";
import CreditTransaction from "@/app/models/CreditTransaction";

export async function POST(req) {
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set in environment variables");
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  try {
    await connectDB();

    if (eventType === "user.created" || eventType === "user.updated") {
      // Validate required fields
      if (!id) {
        console.error("Missing user ID");
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      if (!email_addresses || email_addresses.length === 0) {
        console.error("Missing email addresses");
        return NextResponse.json(
          { error: "Missing email addresses" },
          { status: 400 },
        );
      }

      const profileFields = {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url || "",
        updatedAt: new Date(),
      };

      // On insert (new user) seed the starting credit balance; never
      // overwrite credits on a subsequent user.updated event.
      const user = await User.findOneAndUpdate(
        { clerkId: id },
        {
          $set: profileFields,
          $setOnInsert: { credits: INITIAL_CREDITS },
        },
        { upsert: true, new: true },
      );

      // Record the welcome grant the first time only
      if (eventType === "user.created") {
        const existing = await CreditTransaction.countDocuments({ userId: id });
        if (existing === 0) {
          await CreditTransaction.create({
            userId: id,
            type: "initial_grant",
            credits: INITIAL_CREDITS,
            balanceAfter: INITIAL_CREDITS,
            description: "Welcome bonus — 10 free credits",
          });
        }
      }

      return NextResponse.json(
        {
          message: "User synced successfully",
          userId: user._id.toString(),
        },
        { status: 200 },
      );
    }

    if (eventType === "user.deleted") {
      await User.findOneAndDelete({ clerkId: id });

      return NextResponse.json(
        {
          message: "User deleted successfully",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (error) {
    console.error("❌ ERROR processing webhook:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
