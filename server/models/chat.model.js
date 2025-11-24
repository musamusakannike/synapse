const mongoose = require("mongoose")

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["document", "quiz", "flashcard", "course", "website", "wikipedia"],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { _id: false })

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  attachments: {
    type: [attachmentSchema],
    default: [],
  },
})

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["topic", "document", "website", "general", "quiz", "flashcard", "course", "wikipedia"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sourceModel",
    },
    sourceModel: {
      type: String,
      enum: ["Topic", "Document", "Website", "Course", "Quiz", "FlashcardSet"],
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Update lastActivity on message addition
chatSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    this.lastActivity = new Date()
  }
  next()
})

module.exports = mongoose.model("Chat", chatSchema)
