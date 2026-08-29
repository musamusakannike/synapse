import mongoose, { Schema, Document } from 'mongoose';

export type SupportedOS = 'ios' | 'android';

export interface IAppReview extends Document {
  os: SupportedOS;
  inReview: boolean;
  reviewVersion?: string;
  minVersion?: string;
  notes?: string;
  hiddenComponents: string[];
  customFlags: Map<string, boolean> | Record<string, boolean>;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AppReviewSchema: Schema = new Schema<IAppReview>(
  {
    os: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
      unique: true,
      index: true,
    },
    inReview: {
      type: Boolean,
      default: false,
      required: true,
    },
    reviewVersion: {
      type: String,
      trim: true,
      default: '',
    },
    minVersion: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    hiddenComponents: {
      type: [String],
      default: [],
    },
    customFlags: {
      type: Map,
      of: Boolean,
      default: {},
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAppReview>('AppReview', AppReviewSchema);
