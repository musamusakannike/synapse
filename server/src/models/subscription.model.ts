import mongoose, { Schema, Document } from 'mongoose';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'none';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  paystackEmailToken?: string;
  planCode: string;
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
      required: true,
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
