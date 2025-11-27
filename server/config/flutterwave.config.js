const Flutterwave = require("flutterwave-node-v3");

// Initialize Flutterwave SDK
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// Generate unique transaction reference
const createTxRef = () => {
  return "synapse-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
};

// Subscription plan pricing (in NGN)
const SUBSCRIPTION_PLANS = {
  GURU: {
    name: "GURU",
    description: "Synapse GURU Plan - Premium Learning Experience",
    pricing: {
      day: 200,
      week: 1200,
      month: 5000,
    },
    // Duration in milliseconds
    durations: {
      day: 24 * 60 * 60 * 1000, // 1 day
      week: 7 * 24 * 60 * 60 * 1000, // 7 days
      month: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  },
};

// Get plan price
const getPlanPrice = (plan, duration) => {
  if (!SUBSCRIPTION_PLANS[plan]) {
    throw new Error(`Invalid plan: ${plan}`);
  }
  if (!SUBSCRIPTION_PLANS[plan].pricing[duration]) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  return SUBSCRIPTION_PLANS[plan].pricing[duration];
};

// Get plan duration in milliseconds
const getPlanDuration = (plan, duration) => {
  if (!SUBSCRIPTION_PLANS[plan]) {
    throw new Error(`Invalid plan: ${plan}`);
  }
  if (!SUBSCRIPTION_PLANS[plan].durations[duration]) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  return SUBSCRIPTION_PLANS[plan].durations[duration];
};

module.exports = {
  flw,
  createTxRef,
  SUBSCRIPTION_PLANS,
  getPlanPrice,
  getPlanDuration,
};
