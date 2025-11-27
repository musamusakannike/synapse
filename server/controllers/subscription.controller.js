const axios = require("axios");
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const {
  flw,
  createTxRef,
  SUBSCRIPTION_PLANS,
  getPlanPrice,
  getPlanDuration,
} = require("../config/flutterwave.config");

/**
 * Get available subscription plans
 */
const getPlans = async (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      description: plan.description,
      pricing: plan.pricing,
    }));

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans",
    });
  }
};

/**
 * Get user's current subscription status
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "subscriptionTier subscriptionExpiresAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isActive =
      user.subscriptionTier !== "FREE" &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();

    res.json({
      success: true,
      data: {
        tier: user.subscriptionTier,
        expiresAt: user.subscriptionExpiresAt,
        isActive,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription status",
    });
  }
};

/**
 * Initiate subscription payment
 */
const initiatePayment = async (req, res) => {
  try {
    const { plan, duration } = req.body;
    const user = req.user;

    // Validate plan and duration
    if (!plan || !duration) {
      return res.status(400).json({
        success: false,
        message: "Plan and duration are required",
      });
    }

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    if (!["day", "week", "month"].includes(duration)) {
      return res.status(400).json({
        success: false,
        message: "Invalid duration. Must be day, week, or month",
      });
    }

    const amount = getPlanPrice(plan, duration);
    const txRef = createTxRef();

    // Create pending subscription record
    const subscription = await Subscription.create({
      user: user._id,
      plan,
      duration,
      amount,
      currency: "NGN",
      txRef,
      status: "pending",
    });

    // Create Flutterwave payment link
    const payload = {
      tx_ref: txRef,
      amount,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      redirect_url: `${process.env.BACKEND_URL}/api/subscriptions/verify`,
      customer: {
        email: user.email,
        name: user.name || "Synapse User",
      },
      customizations: {
        title: "Synapse Subscription",
        description: `${plan} Plan - ${duration}ly subscription`,
        logo: process.env.APP_LOGO_URL || "https://synapse.app/logo.png",
      },
      meta: {
        subscription_id: subscription._id.toString(),
        user_id: user._id.toString(),
        plan,
        duration,
      },
    };

    if (!process.env.FLW_SECRET_KEY) {
      subscription.status = "failed";
      await subscription.save();
      return res.status(503).json({
        success: false,
        message: "Payment service is not configured",
      });
    }

    const fwResponse = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response = fwResponse.data;

    if (response.status === "success" && response.data && response.data.link) {
      res.json({
        success: true,
        data: {
          paymentLink: response.data.link,
          txRef,
          amount,
          plan,
          duration,
        },
      });
    } else {
      // Mark subscription as failed
      subscription.status = "failed";
      await subscription.save();

      res.status(400).json({
        success: false,
        message: "Could not generate payment link",
      });
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
};

/**
 * Verify payment after redirect from Flutterwave
 */
const verifyPayment = async (req, res) => {
  try {
    const { status, transaction_id, tx_ref } = req.query;

    // Find the subscription
    const subscription = await Subscription.findOne({ txRef: tx_ref });

    if (!subscription) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/subscription?status=error&message=Transaction not found`
      );
    }

    // Already processed
    if (subscription.status === "successful") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/subscription?status=success&message=Subscription already active`
      );
    }

    if (status === "completed" || status === "successful") {
      // Verify with Flutterwave
      if (!flw) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/subscription?status=error&message=Payment service not configured`
        );
      }
      const response = await flw.Transaction.verify({ id: transaction_id });

      if (
        response.data.status === "successful" &&
        response.data.amount >= subscription.amount &&
        response.data.currency === "NGN"
      ) {
        // Calculate subscription dates
        const now = new Date();
        const durationMs = getPlanDuration(
          subscription.plan,
          subscription.duration
        );
        const expiresAt = new Date(now.getTime() + durationMs);

        // Update subscription
        subscription.status = "successful";
        subscription.flutterwaveTransactionId = transaction_id;
        subscription.startsAt = now;
        subscription.expiresAt = expiresAt;
        subscription.paymentMethod = response.data.payment_type;
        subscription.paymentDetails = {
          card_type: response.data.card?.type,
          last_4: response.data.card?.last_4digits,
          bank: response.data.card?.issuer,
        };
        await subscription.save();

        // Update user subscription
        const user = await User.findById(subscription.user);
        
        // If user already has an active subscription, extend it
        if (
          user.subscriptionTier === subscription.plan &&
          user.subscriptionExpiresAt &&
          new Date(user.subscriptionExpiresAt) > now
        ) {
          user.subscriptionExpiresAt = new Date(
            new Date(user.subscriptionExpiresAt).getTime() + durationMs
          );
        } else {
          user.subscriptionTier = subscription.plan;
          user.subscriptionExpiresAt = expiresAt;
        }
        await user.save();

        return res.redirect(
          `${process.env.FRONTEND_URL}/subscription?status=success&message=Subscription activated successfully`
        );
      } else {
        subscription.status = "failed";
        await subscription.save();

        return res.redirect(
          `${process.env.FRONTEND_URL}/subscription?status=error&message=Payment verification failed`
        );
      }
    } else {
      subscription.status = status === "cancelled" ? "cancelled" : "failed";
      await subscription.save();

      return res.redirect(
        `${process.env.FRONTEND_URL}/subscription?status=error&message=Payment ${status}`
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/subscription?status=error&message=Verification error`
    );
  }
};

/**
 * Flutterwave webhook handler
 */
const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      console.warn("Invalid webhook signature");
      return res.status(401).end();
    }

    const payload = req.body;

    // Handle successful charge
    if (
      payload.event === "charge.completed" &&
      payload.data.status === "successful"
    ) {
      const transactionId = payload.data.id;
      const txRef = payload.data.tx_ref;

      // Find subscription
      const subscription = await Subscription.findOne({ txRef });

      if (!subscription) {
        console.warn(`Subscription not found for tx_ref: ${txRef}`);
        return res.status(200).end();
      }

      // Already processed (idempotency)
      if (subscription.status === "successful") {
        return res.status(200).end();
      }

      // Verify transaction
      if (!flw) {
        console.warn("Flutterwave SDK not initialized, cannot verify webhook transaction");
        return res.status(200).end();
      }
      const response = await flw.Transaction.verify({ id: transactionId });

      if (
        response.data.status === "successful" &&
        response.data.amount >= subscription.amount
      ) {
        // Calculate subscription dates
        const now = new Date();
        const durationMs = getPlanDuration(
          subscription.plan,
          subscription.duration
        );
        const expiresAt = new Date(now.getTime() + durationMs);

        // Update subscription
        subscription.status = "successful";
        subscription.flutterwaveTransactionId = transactionId;
        subscription.startsAt = now;
        subscription.expiresAt = expiresAt;
        subscription.paymentMethod = response.data.payment_type;
        subscription.paymentDetails = {
          card_type: response.data.card?.type,
          last_4: response.data.card?.last_4digits,
          bank: response.data.card?.issuer,
        };
        await subscription.save();

        // Update user subscription
        const user = await User.findById(subscription.user);
        
        if (user) {
          // If user already has an active subscription, extend it
          if (
            user.subscriptionTier === subscription.plan &&
            user.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) > now
          ) {
            user.subscriptionExpiresAt = new Date(
              new Date(user.subscriptionExpiresAt).getTime() + durationMs
            );
          } else {
            user.subscriptionTier = subscription.plan;
            user.subscriptionExpiresAt = expiresAt;
          }
          await user.save();
        }

        console.log(`Subscription activated via webhook for tx_ref: ${txRef}`);
      }
    }

    // Acknowledge receipt
    res.status(200).end();
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).end(); // Always return 200 to prevent retries
  }
};

/**
 * Get user's subscription history
 */
const getSubscriptionHistory = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user._id,
      status: "successful",
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription history",
    });
  }
};

module.exports = {
  getPlans,
  getSubscriptionStatus,
  initiatePayment,
  verifyPayment,
  handleWebhook,
  getSubscriptionHistory,
};
