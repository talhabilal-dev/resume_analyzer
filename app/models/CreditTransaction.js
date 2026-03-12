import mongoose from "mongoose";

/**
 * CreditTransaction — append-only credit ledger.
 *
 * Every credit change (grant, purchase, usage, refund, bonus) creates one
 * document here. balance never gets mutated in place; balanceAfter gives a
 * running snapshot for debugging and eventual reconciliation.
 */
const CreditTransactionSchema = new mongoose.Schema({
  userId: {
    type: String,        // Clerk userId
    required: true,
    index: true,
  },

  // What caused this transaction
  type: {
    type: String,
    enum: ["initial_grant", "purchase", "usage", "refund", "bonus"],
    required: true,
  },

  // Positive = credits added, negative = credits deducted
  credits: {
    type: Number,
    required: true,
  },

  // Snapshot of the user's balance *after* this transaction was applied
  balanceAfter: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  // Stripe references (only set for purchase / refund)
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  stripeSessionId: {
    type: String,
    default: null,
  },

  // Which analysis consumed these credits (only for usage)
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Analysis",
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CreditTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.CreditTransaction ||
  mongoose.model("CreditTransaction", CreditTransactionSchema);
