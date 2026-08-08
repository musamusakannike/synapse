import mongoose from 'mongoose';
import Notification, {
  INotification,
  NotificationCategory,
  NotificationType,
} from '../models/notification.model';
import { ICourse } from '../models/course.model';
import { IUser } from '../models/user.model';
import { sendPushToUser, sendPushToAllUsers } from '../utils/push.util';

/**
 * The single entry point for producing notifications. Controllers and jobs go
 * through here rather than touching the model and push utils directly, so
 * dedupe and scheduling behaviour can't be forgotten at a call site.
 */

export interface NotifyInput {
  /** Omit or pass null to broadcast to every user. */
  user?: mongoose.Types.ObjectId | string | null;
  type?: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  /**
   * Unique per logical event. A second attempt with the same key is dropped,
   * which is what stops an hourly cron from re-sending the same nudge.
   */
  dedupeKey?: string;
  /** Future date defers delivery to the scheduler sweep. */
  scheduledFor?: Date | null;
}

export interface NotifyResult {
  notification: INotification | null;
  /** False when a dedupeKey collision meant this was already handled. */
  created: boolean;
  /** True when the push went out now (rather than being queued for later). */
  delivered: boolean;
}

/**
 * Creates a notification and, unless it is scheduled for the future, pushes it.
 *
 * Never throws: a failed nudge must not take down the request that triggered
 * it. Callers that care can inspect the result.
 */
export async function notify(input: NotifyInput): Promise<NotifyResult> {
  const {
    user = null,
    type = 'info',
    category,
    title,
    message,
    actionUrl = '',
    data = {},
    dedupeKey,
    scheduledFor = null,
  } = input;

  const isDeferred = scheduledFor instanceof Date && scheduledFor.getTime() > Date.now();

  try {
    const doc = {
      user: user ? new mongoose.Types.ObjectId(String(user)) : null,
      type,
      category,
      title,
      message,
      actionUrl,
      data,
      scheduledFor,
      sentAt: null as Date | null,
      ...(dedupeKey ? { dedupeKey } : {}),
    };

    let notification: INotification;

    if (dedupeKey) {
      // Upsert-on-key: concurrent cron ticks race here safely, and only the
      // insert winner gets `created: true` and therefore sends the push.
      const existing = await Notification.findOne({ dedupeKey });
      if (existing) {
        return { notification: existing, created: false, delivered: false };
      }
      try {
        notification = await Notification.create(doc);
      } catch (err) {
        // Unique index rejected a concurrent insert — someone else got there.
        if ((err as { code?: number }).code === 11000) {
          return { notification: null, created: false, delivered: false };
        }
        throw err;
      }
    } else {
      notification = await Notification.create(doc);
    }

    if (isDeferred) {
      return { notification, created: true, delivered: false };
    }

    await deliver(notification);
    return { notification, created: true, delivered: true };
  } catch (error) {
    console.error(`Failed to create notification (${category}):`, error);
    return { notification: null, created: false, delivered: false };
  }
}

/**
 * Sends the push for an already-persisted notification and stamps `sentAt`.
 * Used both for immediate delivery and by the scheduler's due-sweep.
 */
export async function deliver(notification: INotification): Promise<void> {
  const payload = {
    notificationId: String(notification._id),
    actionUrl: notification.actionUrl || '',
    type: notification.type,
    category: notification.category,
    ...(notification.data || {}),
  };

  try {
    if (notification.user) {
      await sendPushToUser(
        notification.user.toString(),
        notification.title,
        notification.message,
        payload
      );
    } else {
      await sendPushToAllUsers(notification.title, notification.message, payload);
    }
  } catch (error) {
    console.error('Push delivery failed:', error);
  }

  notification.sentAt = new Date();
  await notification.save();
}

/* ------------------------------------------------------------------ *
 * Archetype helpers — one per notification kind the app actually sends.
 * ------------------------------------------------------------------ */

/**
 * "Welcome to SabiLearn!" — fires once per account, on first sign-up through
 * any auth path.
 */
export async function sendWelcomeNotification(user: IUser): Promise<void> {
  await notify({
    user: user._id as mongoose.Types.ObjectId,
    type: 'announcement',
    category: 'welcome',
    title: 'Welcome to SabiLearn!',
    message: `Hi ${user.firstName || 'there'} — start your learning journey by exploring our courses.`,
    actionUrl: '/dashboard/courses',
    dedupeKey: `welcome:${user._id}`,
  });
}

/**
 * "New Course Available" — broadcast when a course becomes publicly visible.
 * Keyed on the course so re-publishing never spams twice.
 */
export async function broadcastCoursePublished(course: ICourse): Promise<void> {
  await notify({
    user: null,
    type: 'info',
    category: 'course',
    title: 'New Course Available',
    message: `${course.title} is now available. ${course.description}`,
    actionUrl: `/dashboard/courses/${course._id}`,
    data: { courseId: String(course._id) },
    dedupeKey: `course-published:${course._id}`,
  });
}

/**
 * "Study Streak Achievement" and friends — the `success` archetype. The
 * dedupeKey is supplied by the caller because milestones repeat over time
 * (streak 7 this month, streak 7 again after a lapse).
 */
export async function sendAchievement(
  userId: mongoose.Types.ObjectId | string,
  title: string,
  message: string,
  dedupeKey: string,
  actionUrl = '/dashboard/progress'
): Promise<void> {
  await notify({
    user: userId,
    type: 'success',
    category: 'achievement',
    title,
    message,
    actionUrl,
    dedupeKey,
  });
}

/** Daily "time to study" nudge. One per user per local day. */
export async function sendStudyReminder(
  userId: mongoose.Types.ObjectId | string,
  title: string,
  message: string,
  dayKey: string
): Promise<boolean> {
  const result = await notify({
    user: userId,
    type: 'info',
    category: 'reminder',
    title,
    message,
    actionUrl: '/dashboard/courses',
    dedupeKey: `reminder:${userId}:${dayKey}`,
  });
  return result.created;
}

/** Evening "your streak is about to break" nudge. One per user per local day. */
export async function sendStreakRiskReminder(
  userId: mongoose.Types.ObjectId | string,
  streak: number,
  dayKey: string
): Promise<boolean> {
  const result = await notify({
    user: userId,
    type: 'warning',
    category: 'streak',
    title: `Don't lose your ${streak}-day streak`,
    message: `You haven't studied today. A few minutes of flashcards keeps your ${streak}-day streak alive.`,
    actionUrl: '/dashboard/courses',
    data: { streak },
    dedupeKey: `streak-risk:${userId}:${dayKey}`,
  });
  return result.created;
}
