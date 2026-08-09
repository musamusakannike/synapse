"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = notify;
exports.deliver = deliver;
exports.sendWelcomeNotification = sendWelcomeNotification;
exports.broadcastCoursePublished = broadcastCoursePublished;
exports.sendAchievement = sendAchievement;
exports.sendStudyReminder = sendStudyReminder;
exports.sendStreakRiskReminder = sendStreakRiskReminder;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const push_util_1 = require("../utils/push.util");
/**
 * Creates a notification and, unless it is scheduled for the future, pushes it.
 *
 * Never throws: a failed nudge must not take down the request that triggered
 * it. Callers that care can inspect the result.
 */
async function notify(input) {
    const { user = null, type = 'info', category, title, message, actionUrl = '', data = {}, dedupeKey, scheduledFor = null, } = input;
    const isDeferred = scheduledFor instanceof Date && scheduledFor.getTime() > Date.now();
    try {
        const doc = {
            user: user ? new mongoose_1.default.Types.ObjectId(String(user)) : null,
            type,
            category,
            title,
            message,
            actionUrl,
            data,
            scheduledFor,
            sentAt: null,
            ...(dedupeKey ? { dedupeKey } : {}),
        };
        let notification;
        if (dedupeKey) {
            // Upsert-on-key: concurrent cron ticks race here safely, and only the
            // insert winner gets `created: true` and therefore sends the push.
            const existing = await notification_model_1.default.findOne({ dedupeKey });
            if (existing) {
                return { notification: existing, created: false, delivered: false };
            }
            try {
                notification = await notification_model_1.default.create(doc);
            }
            catch (err) {
                // Unique index rejected a concurrent insert — someone else got there.
                if (err.code === 11000) {
                    return { notification: null, created: false, delivered: false };
                }
                throw err;
            }
        }
        else {
            notification = await notification_model_1.default.create(doc);
        }
        if (isDeferred) {
            return { notification, created: true, delivered: false };
        }
        await deliver(notification);
        return { notification, created: true, delivered: true };
    }
    catch (error) {
        console.error(`Failed to create notification (${category}):`, error);
        return { notification: null, created: false, delivered: false };
    }
}
/**
 * Sends the push for an already-persisted notification and stamps `sentAt`.
 * Used both for immediate delivery and by the scheduler's due-sweep.
 */
async function deliver(notification) {
    const payload = {
        notificationId: String(notification._id),
        actionUrl: notification.actionUrl || '',
        type: notification.type,
        category: notification.category,
        ...(notification.data || {}),
    };
    try {
        if (notification.user) {
            await (0, push_util_1.sendPushToUser)(notification.user.toString(), notification.title, notification.message, payload);
        }
        else {
            await (0, push_util_1.sendPushToAllUsers)(notification.title, notification.message, payload);
        }
    }
    catch (error) {
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
async function sendWelcomeNotification(user) {
    await notify({
        user: user._id,
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
async function broadcastCoursePublished(course) {
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
async function sendAchievement(userId, title, message, dedupeKey, actionUrl = '/dashboard/progress') {
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
async function sendStudyReminder(userId, title, message, dayKey) {
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
async function sendStreakRiskReminder(userId, streak, dayKey) {
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
