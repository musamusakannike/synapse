import { ISubscription } from '../models/subscription.model';

/** Manual (bank transfer/USSD-friendly) subscriptions grant this many days per successful charge. */
export const MANUAL_SUBSCRIPTION_DAYS = 30;

/**
 * A 'recurring' (card) subscription is trusted on its `status` alone — Paystack's
 * subscription/invoice webhooks keep that in sync. A 'manual' subscription has no
 * such webhook, so it's only active while `currentPeriodEnd` hasn't passed yet.
 */
export const isSubscriptionActive = (subscription: Pick<ISubscription, 'status' | 'currentPeriodEnd'> | null | undefined): boolean => {
  if (!subscription || subscription.status !== 'active') return false;
  if (!subscription.currentPeriodEnd) return true;
  return subscription.currentPeriodEnd.getTime() > Date.now();
};
