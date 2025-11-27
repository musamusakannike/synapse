const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["GURU"],
      required: true,
    },
    duration: {
      type: String,
      enum: ["day", "week", "month"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
    },
    flutterwaveTransactionId: {
      type: String,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },
    startsAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ txRef: 1 });
SubscriptionSchema.index({ flutterwaveTransactionId: 1 });

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
module.exports = Subscription;
