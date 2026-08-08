import mongoose, { Schema, Document } from 'mongoose';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'none';
/**
 * 'recurring' = Paystack Plan, card-only, auto-debits monthly.
 * 'manual' = one-off charge (any channel, incl. bank transfer/USSD) that grants
 * 30 days of access; the user has to come back and pay again to renew.
 */
export type SubscriptionBillingType = 'recurring' | 'manual';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  billingType: SubscriptionBillingType;
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  paystackEmailToken?: string;
  planCode?: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    billingType: {
      type: String,
      enum: ['recurring', 'manual'],
      default: 'manual',
    },
    paystackCustomerCode: {
      type: String,
    },
    paystackSubscriptionCode: {
      type: String,
    },
    paystackEmailToken: {
      type: String,
    },
    planCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'none'],
      default: 'none',
      index: true,
    },
    currentPeriodEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
