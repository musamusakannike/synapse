"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseProgress = exports.getTopicProgress = exports.updateContentPosition = exports.submitMcqSession = exports.submitFlashcardSession = exports.getNeedsImprovement = exports.getContinueStudying = exports.getProgress = exports.getDashboard = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const studySession_model_1 = __importDefault(require("../models/studySession.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const userProgress_model_1 = __importDefault(require("../models/userProgress.model"));
const streak_service_1 = require("../services/streak.service");
const notification_service_1 = require("../services/notification.service");
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * Advances the user's streak for today and sends any achievement it earned.
 * Called after every recorded session; a no-op on the day's second session.
 */
async function awardStreakAchievements(userId) {
    try {
        const result = await (0, streak_service_1.recordStudyDay)(userId);
        if (result) {
            await (0, streak_service_1.announceStreakProgress)(userId, result);
        }
    }
    catch (error) {
        console.error('Failed to record study streak:', error);
    }
}
const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const progress = await userProgress_model_1.default.find({ user: userId })
            .populate({ path: 'course', select: 'title description banner category difficulty' })
            .populate({ path: 'topic', select: 'title description' })
            .sort({ lastStudiedAt: -1 })
            .limit(4);
        const totalSessions = await studySession_model_1.default.countDocuments({ user: userId });
        const totalFlashcards = await studySession_model_1.default.aggregate([
            { $match: { user: userId._id } },
            { $group: { _id: null, total: { $sum: '$flashcardsStudied' } } },
        ]);
        const mcqStats = await studySession_model_1.default.aggregate([
            { $match: { user: userId._id, type: 'mcq' } },
            { $group: { _id: null, totalAnswered: { $sum: '$mcqAnswered' }, totalCorrect: { $sum: '$mcqCorrect' } } },
        ]);
        const avgAccuracy = mcqStats.length > 0 && mcqStats[0].totalAnswered > 0
            ? Math.round((mcqStats[0].totalCorrect / mcqStats[0].totalAnswered) * 100)
            : 0;
        res.status(200).json({
            success: true,
            data: {
                continueStudying: progress,
                quickStats: {
                    totalSessions,
                    totalFlashcards: totalFlashcards[0]?.total || 0,
                    avgAccuracy,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
const getProgress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const sessions = await studySession_model_1.default.find({ user: userId }).sort({ createdAt: -1 });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySessions = sessions.filter((s) => s.createdAt >= today);
        const todayStudyTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        // Read the stored streak rather than recomputing it here: the scheduler and
        // the achievement notifications work off the same field, and two
        // independent calculations would eventually disagree.
        const user = await user_model_1.default.findById(userId).select('currentStreak longestStreak lastStudyDate settings.dailyGoalMinutes');
        const streak = user?.currentStreak ?? 0;
        const longestStreak = user?.longestStreak ?? 0;
        const dailyGoalMinutes = user?.settings?.dailyGoalMinutes ?? 15;
        const totalFlashcards = sessions.reduce((sum, s) => sum + s.flashcardsStudied, 0);
        const mcqSessions = sessions.filter((s) => s.type === 'mcq');
        const totalMcqAnswered = mcqSessions.reduce((sum, s) => sum + s.mcqAnswered, 0);
        const totalMcqCorrect = mcqSessions.reduce((sum, s) => sum + s.mcqCorrect, 0);
        const avgAccuracy = totalMcqAnswered > 0 ? Math.round((totalMcqCorrect / totalMcqAnswered) * 100) : 0;
        const todayStudyMinutes = Math.round(todayStudyTime / 60);
        const dailyGoalProgress = dailyGoalMinutes > 0 ? Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100)) : 0;
        res.status(200).json({
            success: true,
            data: {
                streak,
                longestStreak,
                todayStudyTime,
                totalSessions: sessions.length,
                totalFlashcards,
                avgAccuracy,
                dailyGoal: {
                    minutes: dailyGoalMinutes,
                    studiedMinutes: todayStudyMinutes,
                    progress: dailyGoalProgress,
                    met: todayStudyMinutes >= dailyGoalMinutes,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProgress = getProgress;
const getContinueStudying = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const progress = await userProgress_model_1.default.find({
            user: userId,
            isCompleted: false,
            lastStudiedAt: { $ne: null },
        })
            .populate({ path: 'course', select: 'title description banner category difficulty' })
            .populate({ path: 'topic', select: 'title description' })
            .sort({ lastStudiedAt: -1 });
        res.status(200).json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
};
exports.getContinueStudying = getContinueStudying;
const getNeedsImprovement = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const progress = await userProgress_model_1.default.find({
            user: userId,
            mcqsAttempted: { $gt: 0 },
        })
            .populate({ path: 'course', select: 'title description banner category difficulty' })
            .populate({ path: 'topic', select: 'title description' })
            .lean();
        const needsImprovement = progress
            .filter((p) => {
            const accuracy = (p.mcqsCorrect / p.mcqsAttempted) * 100;
            return accuracy < 60;
        })
            .map((p) => ({
            ...p,
            accuracy: Math.round((p.mcqsCorrect / p.mcqsAttempted) * 100),
        }));
        res.status(200).json({ success: true, data: needsImprovement });
    }
    catch (error) {
        next(error);
    }
};
exports.getNeedsImprovement = getNeedsImprovement;
const submitFlashcardSession = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { course, topic, flashcardsStudied, duration } = req.body;
        await studySession_model_1.default.create({
            user: userId,
            course,
            topic,
            type: 'flashcard',
            flashcardsStudied,
            duration,
        });
        const flashcardCount = await flashcard_model_1.default.countDocuments({ topic });
        let progress = await userProgress_model_1.default.findOne({ user: userId, course, topic });
        if (!progress) {
            progress = await userProgress_model_1.default.create({
                user: userId,
                course,
                topic,
                flashcardsStudied,
                flashcardsTotal: flashcardCount,
                lastStudiedAt: new Date(),
            });
        }
        else {
            progress.flashcardsStudied += flashcardsStudied;
            progress.flashcardsTotal = flashcardCount;
            progress.lastStudiedAt = new Date();
            if (progress.flashcardsStudied >= flashcardCount && flashcardCount > 0) {
                const wasCompleted = progress.isCompleted;
                progress.isCompleted = true;
                if (!wasCompleted) {
                    const courseDoc = await course_model_1.default.findById(course).select('title');
                    void (0, notification_service_1.sendAchievement)(userId, 'Topic Complete', `You have studied every flashcard in a topic of ${courseDoc?.title || 'this course'}. Try the practice questions next.`, `achievement:topic-complete:${userId}:${topic}`, `/course/${course}`);
                }
            }
            await progress.save();
        }
        void awardStreakAchievements(userId);
        res.status(200).json({ success: true, message: 'Flashcard session recorded.' });
    }
    catch (error) {
        next(error);
    }
};
exports.submitFlashcardSession = submitFlashcardSession;
const submitMcqSession = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { course, topic, mcqAnswered, mcqCorrect, score, duration } = req.body;
        await studySession_model_1.default.create({
            user: userId,
            course,
            topic,
            type: 'mcq',
            mcqAnswered,
            mcqCorrect,
            score,
            duration,
        });
        let progress = await userProgress_model_1.default.findOne({ user: userId, course, topic });
        if (!progress) {
            const flashcardCount = await flashcard_model_1.default.countDocuments({ topic });
            progress = await userProgress_model_1.default.create({
                user: userId,
                course,
                topic,
                flashcardsTotal: flashcardCount,
                mcqsAttempted: mcqAnswered,
                mcqsCorrect: mcqCorrect,
                lastStudiedAt: new Date(),
            });
        }
        else {
            progress.mcqsAttempted += mcqAnswered;
            progress.mcqsCorrect += mcqCorrect;
            progress.lastStudiedAt = new Date();
            await progress.save();
        }
        // A perfect run is worth calling out, but only on a set big enough to mean
        // something — congratulating a 1-for-1 cheapens every other achievement.
        if (mcqAnswered >= 5 && mcqCorrect === mcqAnswered) {
            const courseDoc = await course_model_1.default.findById(course).select('title');
            void (0, notification_service_1.sendAchievement)(userId, 'Perfect Score', `${mcqAnswered}/${mcqAnswered} on ${courseDoc?.title || 'this course'}. Flawless.`, `achievement:perfect:${userId}:${topic}:${mcqAnswered}`, `/course/${course}`);
        }
        void awardStreakAchievements(userId);
        res.status(200).json({ success: true, message: 'MCQ session recorded.' });
    }
    catch (error) {
        next(error);
    }
};
exports.submitMcqSession = submitMcqSession;
/**
 * Saves exactly which content block within a topic the learner is on, so
 * "continue studying" can resume mid-lesson instead of restarting the topic.
 * Called frequently (e.g. as the learner scrolls/steps through content), so
 * it deliberately skips the streak/session bookkeeping that the flashcard and
 * MCQ endpoints do.
 */
const updateContentPosition = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { course, topic, contentIndex } = req.body;
        const progress = await userProgress_model_1.default.findOneAndUpdate({ user: userId, course, topic }, { $set: { lastContentIndex: contentIndex, lastStudiedAt: new Date() } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        res.status(200).json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
};
exports.updateContentPosition = updateContentPosition;
/**
 * The learner's saved position within a single topic, so the lesson player can
 * resume at the exact content block instead of restarting from the top.
 */
const getTopicProgress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { topicId } = req.params;
        const progress = await userProgress_model_1.default.findOne({ user: userId, topic: topicId }).select('lastContentIndex isCompleted lastStudiedAt');
        res.status(200).json({ success: true, data: progress || { lastContentIndex: 0, isCompleted: false, lastStudiedAt: null } });
    }
    catch (error) {
        next(error);
    }
};
exports.getTopicProgress = getTopicProgress;
/**
 * Percent of a course's topics the learner has completed, for the course-level
 * progress bar shown on the course/dashboard screens.
 */
const getCourseProgress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;
        const totalTopics = await topic_model_1.default.countDocuments({ course: courseId, isPublished: true });
        const completedTopics = await userProgress_model_1.default.countDocuments({ user: userId, course: courseId, isCompleted: true });
        const percentComplete = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        res.status(200).json({
            success: true,
            data: { course: courseId, totalTopics, completedTopics, percentComplete },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCourseProgress = getCourseProgress;
