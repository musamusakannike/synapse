import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const podcastSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  articleTitle: {
    type: String,
    required: true,
    trim: true
  },
  articleContent: {
    type: String,
    required: true
  },
  script: {
    type: String,
    required: true
  },
  podcastStyle: {
    type: String,
    enum: ["professional", "casual", "energetic", "educational"],
    default: "professional"
  },
  voiceSettings: {
    gender: {
      type: String,
      enum: ["NEUTRAL", "MALE", "FEMALE"],
      default: "NEUTRAL"
    },
    speed: {
      type: Number,
      min: 0.25,
      max: 4.0,
      default: 1.0
    },
    pitch: {
      type: Number,
      min: -20.0,
      max: 20.0,
      default: 0.0
    }
  },
  audioMetadata: {
    audioId: String,
    fileName: String,
    fileSize: String,
    duration: String
  },
  analytics: {
    wordCount: {
      type: Number,
      default: 0
    },
    estimatedDuration: String,
    generationTime: {
      type: Number, // in milliseconds
      default: 0
    }
  },
  status: {
    type: String,
    enum: ["script_only", "audio_generated", "failed"],
    default: "script_only"
  }
}, {
  timestamps: true
});

// Index for efficient user-based queries
podcastSchema.index({ user: 1, createdAt: -1 });

// Index for searching by article title
podcastSchema.index({ articleTitle: "text" });

// Add pagination plugin
podcastSchema.plugin(mongoosePaginate);

const Podcast = mongoose.model("Podcast", podcastSchema);

export default Podcast;