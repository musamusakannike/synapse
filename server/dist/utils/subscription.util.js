"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubscriptionActive = exports.MANUAL_SUBSCRIPTION_DAYS = void 0;
/** Manual (bank transfer/USSD-friendly) subscriptions grant this many days per successful charge. */
exports.MANUAL_SUBSCRIPTION_DAYS = 30;
/**
 * A 'recurring' (card) subscription is trusted on its `status` alone — Paystack's
 * subscription/invoice webhooks keep that in sync. A 'manual' subscription has no
 * such webhook, so it's only active while `currentPeriodEnd` hasn't passed yet.
 */
const isSubscriptionActive = (subscription) => {
    if (!subscription || subscription.status !== 'active')
        return false;
    if (!subscription.currentPeriodEnd)
        return true;
    return subscription.currentPeriodEnd.getTime() > Date.now();
};
exports.isSubscriptionActive = isSubscriptionActive;
