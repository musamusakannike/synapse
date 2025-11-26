const mongoose = require("mongoose");

const flashcardItemSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  tags: [{
    type: String,
    trim: true,
  }],
});

const flashcardSetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    sourceType: {
      type: String,
      enum: ["topic", "document", "website", "course", "manual"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sourceModel",
    },
    sourceModel: {
      type: String,
      enum: ["Topic", "Document", "Website", "Course"],
    },
    flashcards: [flashcardItemSchema],
    settings: {
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "mixed"],
        default: "medium",
      },
      numberOfCards: {
        type: Number,
        default: 10,
        min: 1,
        max: 50,
      },
      includeDefinitions: {
        type: Boolean,
        default: true,
      },
      includeExamples: {
        type: Boolean,
        default: false,
      },
      focusAreas: [{
        type: String,
        trim: true,
      }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    studyStats: {
      totalStudySessions: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      lastStudied: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
flashcardSetSchema.index({ userId: 1, isActive: 1 });
flashcardSetSchema.index({ sourceType: 1, sourceId: 1 });

module.exports = mongoose.model("FlashcardSet", flashcardSetSchema);
