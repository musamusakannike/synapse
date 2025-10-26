const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    outline: [
      {
        section: { type: String, required: true },
        subsections: [{ type: String }],
      },
    ],
    content: [
      {
        section: { type: String, required: true },
        subsection: { type: String },
        explanation: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["generating_outline", "generating_content", "completed", "failed"],
      default: "generating_outline",
    },
    settings: {
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "intermediate",
      },
      includeExamples: { type: Boolean, default: true },
      includePracticeQuestions: { type: Boolean, default: false },
      detailLevel: {
        type: String,
        enum: ["brief", "moderate", "comprehensive"],
        default: "moderate",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
