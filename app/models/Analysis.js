import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
  },
  companyName: {
    type: String,
  },
  feedback: {
    overallScore: {
      type: Number,
      required: true,
    },
    toneAndStyle: {
      score: Number,
      tips: [
        {
          type: { type: String, enum: ["good", "improve"] },
          tip: String,
          explanation: String,
        },
      ],
    },
    content: {
      score: Number,
      tips: [
        {
          type: { type: String, enum: ["good", "improve"] },
          tip: String,
          explanation: String,
        },
      ],
    },
    structure: {
      score: Number,
      tips: [
        {
          type: { type: String, enum: ["good", "improve"] },
          tip: String,
          explanation: String,
        },
      ],
    },
    skills: {
      score: Number,
      tips: [
        {
          type: { type: String, enum: ["good", "improve"] },
          tip: String,
          explanation: String,
        },
      ],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
AnalysisSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Analysis ||
  mongoose.model("Analysis", AnalysisSchema);
