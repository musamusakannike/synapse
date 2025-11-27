const express = require("express");
const router = express.Router();
const {
  getPlans,
  getSubscriptionStatus,
  initiatePayment,
  verifyPayment,
  handleWebhook,
  getSubscriptionHistory,
} = require("../controllers/subscription.controller");
const { protect } = require("../middlewares/auth.middleware");

// Public routes
router.get("/plans", getPlans);
router.get("/verify", verifyPayment); // Redirect from Flutterwave
router.post("/webhook", handleWebhook); // Flutterwave webhook

// Protected routes (require authentication)
router.get("/status", protect, getSubscriptionStatus);
router.post("/initiate", protect, initiatePayment);
router.get("/history", protect, getSubscriptionHistory);

module.exports = router;
