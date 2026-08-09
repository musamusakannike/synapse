"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStudyReminders = runStudyReminders;
exports.runStreakRiskReminders = runStreakRiskReminders;
exports.runScheduledDispatch = runScheduledDispatch;
exports.runLapsedStreakCleanup = runLapsedStreakCleanup;
exports.startScheduler = startScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const studySession_model_1 = __importDefault(require("../models/studySession.model"));
const notification_service_1 = require("../services/notification.service");
const streak_service_1 = require("../services/streak.service");
const time_util_1 = require("../utils/time.util");
/**
 * Recurring engagement jobs.
 *
 * Everything runs in-process on a single node. Each job is idempotent through
 * dedupe keys, so a restart mid-tick re-runs safely — but if this server is
 * ever scaled past one instance, move these to a locked job queue or two
 * replicas will both fire the sweep.
 */
/** Local hour at which the "your streak is at risk" nudge goes out. */
const STREAK_RISK_HOUR = 20;
/**
 * How close to the user's chosen minute a tick has to land to count. Must stay
 * strictly below the job interval: at exactly 15 both the :00 and :15 ticks
 * would match a target of :00, and only the dedupe key would stop a double
 * send.
 */
const REMINDER_WINDOW_MINUTES = 15;
/** Guards against a nudge storm if the process has been down for a while. */
const MAX_DUE_PER_SWEEP = 500;
async function hasStudiedToday(user) {
    const dayStart = (0, time_util_1.startOfLocalDay)(new Date(), user.settings?.timezoneOffset ?? 0);
    const count = await studySession_model_1.default.countDocuments({
        user: user._id,
        createdAt: { $gte: dayStart },
    });
    return count > 0;
}
/** Users who can actually receive a push right now. */
function pushableUsersQuery() {
    return {
        expoPushToken: { $exists: true, $ne: '' },
        'settings.pushNotifications': { $ne: false },
    };
}
/**
 * Daily study reminder. Runs every 15 minutes and picks out the users whose
 * chosen local time has just come around, skipping anyone who already studied
 * — a reminder that arrives after you've done the thing teaches people to
 * ignore the app's notifications entirely.
 */
async function runStudyReminders(now = new Date()) {
    const users = await user_model_1.default.find({
        ...pushableUsersQuery(),
        'settings.studyReminders': { $ne: false },
    });
    let sent = 0;
    for (const user of users) {
        const offset = user.settings?.timezoneOffset ?? 0;
        const targetHour = user.settings?.reminderHour ?? 19;
        const targetMinute = user.settings?.reminderMinute ?? 0;
        if ((0, time_util_1.localHour)(now, offset) !== targetHour)
            continue;
        if (Math.abs((0, time_util_1.localMinute)(now, offset) - targetMinute) >= REMINDER_WINDOW_MINUTES)
            continue;
        if (await hasStudiedToday(user))
            continue;
        const dayKey = (0, time_util_1.localDayKey)(now, offset);
        const streak = user.currentStreak;
        const message = streak > 0
            ? `You are on a ${streak}-day streak. A short session keeps it going.`
            : 'A few minutes of flashcards today adds up fast. Pick up where you left off.';
        const created = await (0, notification_service_1.sendStudyReminder)(user._id, 'Time to study', message, dayKey);
        if (created)
            sent += 1;
    }
    return sent;
}
/**
 * Evening streak rescue. Only goes to users with something to lose — a streak
 * of at least two days — so it stays a genuine warning rather than background
 * noise.
 */
async function runStreakRiskReminders(now = new Date()) {
    const users = await user_model_1.default.find({
        ...pushableUsersQuery(),
        'settings.streakAlerts': { $ne: false },
        currentStreak: { $gte: 2 },
    });
    let sent = 0;
    for (const user of users) {
        const offset = user.settings?.timezoneOffset ?? 0;
        if ((0, time_util_1.localHour)(now, offset) !== STREAK_RISK_HOUR)
            continue;
        if (await hasStudiedToday(user))
            continue;
        const dayKey = (0, time_util_1.localDayKey)(now, offset);
        const created = await (0, notification_service_1.sendStreakRiskReminder)(user._id, user.currentStreak, dayKey);
        if (created)
            sent += 1;
    }
    return sent;
}
/**
 * Delivers notifications whose `scheduledFor` has come due — the mechanism
 * behind admin-authored announcements like scheduled maintenance warnings.
 */
async function runScheduledDispatch(now = new Date()) {
    const due = await notification_model_1.default.find({
        scheduledFor: { $ne: null, $lte: now },
        sentAt: null,
    }).limit(MAX_DUE_PER_SWEEP);
    for (const notification of due) {
        await (0, notification_service_1.deliver)(notification);
    }
    return due.length;
}
/**
 * Zeroes streaks that have already lapsed, so a user who stopped studying a
 * week ago doesn't still see "5-day streak" on their dashboard.
 */
async function runLapsedStreakCleanup() {
    return (0, streak_service_1.expireLapsedStreaks)();
}
const JOBS = [
    {
        name: 'scheduled-dispatch',
        expression: '*/5 * * * *', // every 5 minutes
        run: () => runScheduledDispatch(),
    },
    {
        name: 'study-reminders',
        expression: '*/15 * * * *', // every 15 minutes, filtered per user timezone
        run: () => runStudyReminders(),
    },
    {
        name: 'streak-risk',
        expression: '0 * * * *', // hourly on the hour
        run: () => runStreakRiskReminders(),
    },
    {
        name: 'streak-cleanup',
        expression: '30 0 * * *', // 00:30 UTC daily
        run: () => runLapsedStreakCleanup(),
    },
];
let started = false;
/**
 * Starts all recurring jobs. Safe to call once at boot; repeat calls are
 * ignored so a hot reload doesn't double-schedule everything.
 */
function startScheduler() {
    if (started)
        return;
    if (process.env.ENABLE_SCHEDULER === 'false') {
        console.log('Scheduler disabled via ENABLE_SCHEDULER=false');
        return;
    }
    for (const job of JOBS) {
        node_cron_1.default.schedule(job.expression, async () => {
            try {
                const count = await job.run();
                if (typeof count === 'number' && count > 0) {
                    console.log(`[scheduler] ${job.name}: ${count} processed`);
                }
            }
            catch (error) {
                console.error(`[scheduler] ${job.name} failed:`, error);
            }
        });
    }
    started = true;
    console.log(`Scheduler started with ${JOBS.length} jobs`);
}
