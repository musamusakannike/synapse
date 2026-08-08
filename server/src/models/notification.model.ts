import mongoose, { Schema, Document } from 'mongoose';

/**
 * Visual severity — drives the icon and colour in the app.
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'announcement';

/**
 * What produced the notification. Used for per-category preferences and for
 * building dedupe keys, so the same nudge is never delivered twice.
 */
export type NotificationCategory =
  | 'welcome'
  | 'course'
  | 'achievement'
  | 'streak'
  | 'reminder'
  | 'system'
  | 'custom';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  data?: Record<string, unknown>;
  /** When set in the future, the scheduler delivers it instead of the request. */
  scheduledFor?: Date | null;
  /** Set once the push has actually gone out; null means still pending. */
  sentAt?: Date | null;
  /** Unique per logical event, e.g. `streak-risk:<userId>:2026-07-24`. */
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'announcement'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['welcome', 'course', 'achievement', 'streak', 'reminder', 'system', 'custom'],
      default: 'custom',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: '',
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    dedupeKey: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Sparse so the many notifications without a dedupe key don't collide on null.
NotificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

// Drives the scheduler's "what is due" sweep.
NotificationSchema.index({ scheduledFor: 1, sentAt: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
