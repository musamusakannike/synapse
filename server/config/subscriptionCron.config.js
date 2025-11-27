const cron = require("node-cron");
const User = require("../models/user.model");

/**
 * Check and update expired subscriptions
 * Runs every 6 hours
 */
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    // Find all users with expired subscriptions
    const result = await User.updateMany(
      {
        subscriptionTier: { $ne: "FREE" },
        subscriptionExpiresAt: { $lt: now },
      },
      {
        $set: {
          subscriptionTier: "FREE",
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Subscription Cron] ${result.modifiedCount} expired subscriptions downgraded to FREE`
      );
    } else {
      console.log("[Subscription Cron] No expired subscriptions found");
    }
  } catch (error) {
    console.error("[Subscription Cron] Error checking subscriptions:", error);
  }
};

/**
 * Initialize the subscription cron job
 * Runs every 6 hours: at 00:00, 06:00, 12:00, 18:00
 */
const initSubscriptionCron = () => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("[Subscription Cron] Running subscription expiry check...");
    await checkExpiredSubscriptions();
  });

  console.log("[Subscription Cron] Initialized - runs every 6 hours");

  // Run once on startup to catch any missed expirations
  setTimeout(async () => {
    console.log("[Subscription Cron] Running initial subscription check...");
    await checkExpiredSubscriptions();
  }, 5000); // Wait 5 seconds after startup
};

module.exports = {
  initSubscriptionCron,
  checkExpiredSubscriptions,
};
