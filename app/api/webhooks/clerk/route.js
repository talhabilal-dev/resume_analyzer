import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function POST(req) {
  console.log("🚀 WEBHOOK ENDPOINT HIT! Route is working!");
  console.log("Request received at:", new Date().toISOString());

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
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

  const wh = new Webhook(WEBHOOK_SECRET);

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

  console.log("=== CLERK WEBHOOK RECEIVED ===");
  console.log("Event type:", eventType);
  console.log("User ID:", id);
  console.log("Full payload:", JSON.stringify(evt.data, null, 2));

  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected successfully");

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

      const userData = {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url || "",
        updatedAt: new Date(),
      };

      console.log("Saving user data:", userData);

      const user = await User.findOneAndUpdate({ clerkId: id }, userData, {
        upsert: true,
        new: true,
      });

      console.log("✅ User saved successfully!");
      console.log("User document ID:", user._id.toString());
      console.log("User email:", user.email);

      return NextResponse.json(
        {
          message: "User synced successfully",
          userId: user._id.toString(),
        },
        { status: 200 },
      );
    }

    if (eventType === "user.deleted") {
      console.log("Deleting user:", id);
      const result = await User.findOneAndDelete({ clerkId: id });
      console.log("User deleted:", result ? "✅ Success" : "❌ Not found");

      return NextResponse.json(
        {
          message: "User deleted successfully",
        },
        { status: 200 },
      );
    }

    console.log("Unhandled event type:", eventType);
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
