"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordStudyDay = recordStudyDay;
exports.announceStreakProgress = announceStreakProgress;
exports.expireLapsedStreaks = expireLapsedStreaks;
const user_model_1 = __importDefault(require("../models/user.model"));
const time_util_1 = require("../utils/time.util");
const notification_service_1 = require("./notification.service");
/** Streak lengths worth celebrating. */
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];
const MILESTONE_COPY = {
    3: 'Three days in a row. The habit is forming.',
    7: 'A full week of studying. You are in the top tier of learners.',
    14: 'Two weeks straight. This is what exam-ready looks like.',
    30: 'Thirty days. A full month without missing a session.',
    60: 'Sixty days. Genuinely exceptional consistency.',
    100: 'One hundred days. Very few people ever get here.',
    365: 'A full year of daily study. Outstanding.',
};
/**
 * Records that a user studied, advancing (or resetting) their streak.
 *
 * The streak is stored rather than recomputed because a transition — hitting
 * day 7, or being one day from losing it — is only observable at the moment it
 * happens. Idempotent within a day: the second session of the day is a no-op.
 */
async function recordStudyDay(userId) {
    const user = await user_model_1.default.findById(userId);
    if (!user)
        return null;
    const offset = user.settings?.timezoneOffset ?? 0;
    const todayKey = (0, time_util_1.localDayKey)(new Date(), offset);
    const lastKey = user.lastStudyDate ? (0, time_util_1.dateToDayKey)(user.lastStudyDate) : null;
    if (lastKey === todayKey) {
        return {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            isNewDay: false,
            isFirstEver: false,
            milestone: null,
        };
    }
    const isFirstEver = lastKey === null;
    const gap = lastKey ? (0, time_util_1.daysBetweenKeys)(lastKey, todayKey) : null;
    // Exactly one day since the last session continues the streak; anything
    // longer (or a clock that moved backwards) starts a fresh one.
    user.currentStreak = gap === 1 ? user.currentStreak + 1 : 1;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastStudyDate = (0, time_util_1.dayKeyToDate)(todayKey);
    user.totalStudyDays += 1;
    await user.save();
    const milestone = STREAK_MILESTONES.includes(user.currentStreak) ? user.currentStreak : null;
    return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        isNewDay: true,
        isFirstEver,
        milestone,
    };
}
/**
 * Turns a streak transition into the `success` notifications the app sends.
 * Separated from {@link recordStudyDay} so progress recording stays testable
 * without side effects.
 */
async function announceStreakProgress(userId, result) {
    if (!result.isNewDay)
        return;
    if (result.isFirstEver) {
        await (0, notification_service_1.sendAchievement)(userId, 'Study Streak Achievement', 'You have completed your first study session. Keep it up!', `achievement:first-session:${userId}`);
        return;
    }
    if (result.milestone) {
        await (0, notification_service_1.sendAchievement)(userId, `${result.milestone}-Day Streak`, MILESTONE_COPY[result.milestone] || `You have studied ${result.milestone} days in a row.`, `achievement:streak-${result.milestone}:${userId}:${result.longestStreak}`);
    }
}
/**
 * Zeroes out streaks that have already lapsed, so the number the user sees is
 * honest even if they haven't opened the app. Run once daily by the scheduler.
 *
 * @returns how many users were reset.
 */
async function expireLapsedStreaks() {
    const users = await user_model_1.default.find({
        currentStreak: { $gt: 0 },
        lastStudyDate: { $ne: null },
    }).select('currentStreak lastStudyDate settings.timezoneOffset');
    let reset = 0;
    const now = new Date();
    for (const user of users) {
        const offset = user.settings?.timezoneOffset ?? 0;
        const todayKey = (0, time_util_1.localDayKey)(now, offset);
        const lastKey = (0, time_util_1.dateToDayKey)(user.lastStudyDate);
        // A gap of 1 means "studied yesterday, today is still open" — not lapsed.
        if ((0, time_util_1.daysBetweenKeys)(lastKey, todayKey) > 1) {
            user.currentStreak = 0;
            await user.save();
            reset += 1;
        }
    }
    return reset;
}
