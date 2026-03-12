import mongoose from "mongoose";
import CreditTransaction from "./CreditTransaction.js";

export const INITIAL_CREDITS = 10;
export const CREDITS_PER_ANALYSIS = 5;

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },

  // ---------- credits ----------
  credits: {
    type: Number,
    default: 0,
    min: 0,
  },

  // ---------- Stripe ----------
  stripeCustomerId: {
    type: String,
    default: null,
  },

  // ---------- timestamps ----------
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/** Returns true when the user has enough credits for one analysis. */
UserSchema.methods.hasEnoughCredits = function (
  amount = CREDITS_PER_ANALYSIS
) {
  return this.credits >= amount;
};

/**
 * Deducts `amount` credits and records a usage transaction.
 * Throws if the balance would go negative.
 */
UserSchema.methods.deductCredits = async function ({
  amount = CREDITS_PER_ANALYSIS,
  description = "Resume analysis",
  analysisId = null,
} = {}) {
  if (this.credits < amount) {
    throw new Error("Insufficient credits.");
  }

  this.credits -= amount;
  this.updatedAt = new Date();
  await this.save();

  await CreditTransaction.create({
    userId: this.clerkId,
    type: "usage",
    credits: -amount,
    balanceAfter: this.credits,
    description,
    analysisId,
  });

  return this.credits;
};

/**
 * Adds `amount` credits and records the reason as a transaction.
 * `type` should be one of: "initial_grant" | "purchase" | "refund" | "bonus"
 */
UserSchema.methods.addCredits = async function ({
  amount,
  type = "purchase",
  description = "",
  stripePaymentIntentId = null,
  stripeSessionId = null,
} = {}) {
  if (!amount || amount <= 0) throw new Error("Amount must be positive.");

  this.credits += amount;
  this.updatedAt = new Date();
  await this.save();

  await CreditTransaction.create({
    userId: this.clerkId,
    type,
    credits: amount,
    balanceAfter: this.credits,
    description,
    stripePaymentIntentId,
    stripeSessionId,
  });

  return this.credits;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
