import { NextResponse } from "next/server";
import { headers } from "next/headers";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import stripe from "@/lib/stripe";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends signed events here. We only act on
 * checkout.session.completed to credit the user's balance.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   ← from `stripe listen` or Stripe dashboard
 */
export async function POST(req) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Skip if payment wasn't collected (e.g. free trials — won't happen here)
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const { clerkId, planId, credits } = session.metadata ?? {};

    if (!clerkId || !credits) {
      console.error("Missing metadata on session:", session.id);
      return new Response("Missing metadata.", { status: 400 });
    }

    const creditAmount = parseInt(credits, 10);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      console.error("Invalid credits value in metadata:", credits);
      return new Response("Invalid credits value.", { status: 400 });
    }

    try {
      await connectDB();

      const user = await User.findOne({ clerkId });
      if (!user) {
        console.error("User not found for clerkId:", clerkId);
        return new Response("User not found.", { status: 404 });
      }

      await user.addCredits({
        amount: creditAmount,
        type: "purchase",
        description: `Purchased ${planId} plan — ${creditAmount} credits`,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        stripeSessionId: session.id,
      });

      console.log(
        `✅ Added ${creditAmount} credits to ${clerkId} (session ${session.id})`,
      );
    } catch (error) {
      console.error("Error adding credits:", error);
      return new Response("Internal server error.", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
