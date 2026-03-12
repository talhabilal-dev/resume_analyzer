import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import stripe from "@/lib/stripe";
import { CREDITS_PER_DOLLAR, MIN_PURCHASE_DOLLARS, dollarsToCredits } from "@/constants";

/**
 * POST /api/stripe/checkout
 * Body: { amount: number }  — dollar amount the user wants to pay (min $5)
 *
 * Credits awarded = floor(amount * CREDITS_PER_DOLLAR)
 * e.g. $5 → 15 credits, $10 → 30 credits
 *
 * Returns { url } — redirect the client to this Stripe Checkout URL.
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { amount } = await request.json();

    // Validate dollar amount
    const dollars = Number(amount);
    if (!Number.isFinite(dollars) || dollars < MIN_PURCHASE_DOLLARS) {
      return NextResponse.json(
        {
          error: `Minimum purchase is $${MIN_PURCHASE_DOLLARS}.`,
          minimum: MIN_PURCHASE_DOLLARS,
        },
        { status: 400 },
      );
    }

    const credits = dollarsToCredits(dollars);
    // Stripe amounts are in cents
    const amountInCents = Math.round(dollars * 100);

    await connectDB();
    const clerkUser = await currentUser();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Create or reuse a Stripe customer so purchase history stays linked
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        metadata: { clerkId: userId },
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: user.stripeCustomerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: `${credits} Resume Credits`,
              description: `$${dollars} × ${CREDITS_PER_DOLLAR} credits/dollar = ${credits} credits (each analysis costs 5 credits)`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/purchase`,
      metadata: {
        clerkId: userId,
        credits: String(credits),
        dollars: String(dollars),
      },
    });

    return NextResponse.json({ url: session.url, credits });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session.", details: error.message },
      { status: 500 },
    );
  }
}
