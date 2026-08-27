"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseProgress = exports.getTopicProgress = exports.updateContentPosition = exports.submitMcqSession = exports.submitFlashcardSession = exports.getNeedsImprovement = exports.getContinueStudying = exports.getProgress = exports.getDashboard = exports.savePosition = exports.submitExercise = exports.completeTopic = exports.getDashboardResumption = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const studySession_model_1 = __importDefault(require("../models/studySession.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const userProgress_model_1 = __importDefault(require("../models/userProgress.model"));
const streak_service_1 = require("../services/streak.service");
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
const xpLog_model_1 = __importDefault(require("../models/xpLog.model"));
const getDashboardResumption = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const progressList = await userProgress_model_1.default.find({ user: userId, isCompleted: false })
            .populate({
            path: 'course',
            match: { isPublished: true },
            select: 'title description banner category difficulty authors isPublished',
        })
            .populate({ path: 'lastChapter', select: 'title' })
            .populate({ path: 'lastTopic', select: 'title' })
            .sort({ lastStudiedAt: -1 });
        const validProgressList = progressList.filter((p) => {
            const course = p.course;
            return course && course._id && course.isPublished !== false;
        });
        const totalUnfinished = validProgressList.length;
        const cards = validProgressList.slice(0, 4);
        res.status(200).json({
            success: true,
            data: {
                resumptionCards: cards,
                totalUnfinished,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardResumption = getDashboardResumption;
const completeTopic = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { courseId, topicId } = req.body;
        const topic = await topic_model_1.default.findById(topicId);
        if (!topic) {
            res.status(404).json({ success: false, message: 'Topic not found.' });
            return;
        }
        let earnedXp = 0;
        const existingLog = await xpLog_model_1.default.findOne({ user: userId, sourceType: 'topic', sourceId: topicId });
        if (!existingLog) {
            earnedXp = topic.xp || 50;
            await xpLog_model_1.default.create({
                user: userId,
                xp: earnedXp,
                sourceType: 'topic',
                sourceId: topicId,
                course: courseId,
            });
            await user_model_1.default.findByIdAndUpdate(userId, { $inc: { totalXp: earnedXp } });
        }
        let progress = await userProgress_model_1.default.findOne({ user: userId, course: courseId });
        if (!progress) {
            progress = new userProgress_model_1.default({ user: userId, course: courseId, completedTopics: [], completedChapters: [] });
        }
        const topicObjId = new mongoose_1.default.Types.ObjectId(topicId);
        if (!progress.completedTopics.some((id) => id.toString() === topicId)) {
            progress.completedTopics.push(topicObjId);
        }
        progress.lastTopic = topicObjId;
        if (topic.chapter) {
            progress.lastChapter = topic.chapter;
        }
        progress.lastStudiedAt = new Date();
        const totalTopicsInCourse = await topic_model_1.default.countDocuments({ course: courseId });
        if (totalTopicsInCourse > 0) {
            progress.percentCompleted = Math.min(100, Math.round((progress.completedTopics.length / totalTopicsInCourse) * 100));
            if (progress.percentCompleted >= 100) {
                progress.isCompleted = true;
            }
        }
        await progress.save();
        void awardStreakAchievements(userId);
        const user = await user_model_1.default.findById(userId).select('totalXp');
        res.status(200).json({
            success: true,
            message: 'Topic completed successfully.',
            earnedXp,
            totalXp: user?.totalXp || 0,
            progress,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeTopic = completeTopic;
const submitExercise = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { courseId, topicId, chapterId, answers } = req.body;
        // answers: Array of { questionId: string, questionXp: number, isCorrect: boolean }
        if (!Array.isArray(answers) || answers.length === 0) {
            res.status(400).json({ success: false, message: 'Answers array is required.' });
            return;
        }
        let totalEarnedXp = 0;
        let correctCount = 0;
        for (const ans of answers) {
            if (ans.isCorrect) {
                correctCount++;
                const questionId = ans.questionId;
                const qXp = ans.questionXp || 20;
                const existingLog = await xpLog_model_1.default.findOne({ user: userId, sourceType: 'exercise_question', sourceId: questionId });
                if (!existingLog) {
                    totalEarnedXp += qXp;
                    await xpLog_model_1.default.create({
                        user: userId,
                        xp: qXp,
                        sourceType: 'exercise_question',
                        sourceId: questionId,
                        course: courseId,
                    });
                }
            }
        }
        if (totalEarnedXp > 0) {
            await user_model_1.default.findByIdAndUpdate(userId, { $inc: { totalXp: totalEarnedXp } });
        }
        const scorePercent = Math.round((correctCount / answers.length) * 100);
        const isPassed = scorePercent >= 50;
        let progress = await userProgress_model_1.default.findOne({ user: userId, course: courseId });
        if (!progress) {
            progress = new userProgress_model_1.default({ user: userId, course: courseId, completedTopics: [], completedChapters: [], passedExercises: [] });
        }
        const exerciseKey = topicId ? `topic_${topicId}` : `chapter_${chapterId}`;
        if (isPassed && !progress.passedExercises.includes(exerciseKey)) {
            progress.passedExercises.push(exerciseKey);
        }
        if (isPassed && topicId) {
            const topicObjId = new mongoose_1.default.Types.ObjectId(topicId);
            if (!progress.completedTopics.some((id) => id.toString() === topicId)) {
                progress.completedTopics.push(topicObjId);
            }
        }
        progress.lastStudiedAt = new Date();
        await progress.save();
        void awardStreakAchievements(userId);
        const user = await user_model_1.default.findById(userId).select('totalXp');
        res.status(200).json({
            success: true,
            scorePercent,
            isPassed,
            earnedXp: totalEarnedXp,
            totalXp: user?.totalXp || 0,
            progress,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitExercise = submitExercise;
const savePosition = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { courseId, chapterId, topicId, contentIndex } = req.body;
        const progress = await userProgress_model_1.default.findOneAndUpdate({ user: userId, course: courseId }, {
            $set: {
                lastChapter: chapterId || null,
                lastTopic: topicId || null,
                lastContentIndex: contentIndex || 0,
                lastStudiedAt: new Date(),
            },
        }, { new: true, upsert: true });
        res.status(200).json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
};
exports.savePosition = savePosition;
const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const progress = await userProgress_model_1.default.find({ user: userId })
            .populate({
            path: 'course',
            match: { isPublished: true },
            select: 'title description banner category difficulty isPublished',
        })
            .populate({ path: 'topic', select: 'title description' })
            .sort({ lastStudiedAt: -1 });
        const validProgress = progress
            .filter((p) => {
            const course = p.course;
            return course && course._id && course.isPublished !== false;
        })
            .slice(0, 4);
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
                continueStudying: validProgress,
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
            .populate({
            path: 'course',
            match: { isPublished: true },
            select: 'title description banner category difficulty isPublished',
        })
            .populate({ path: 'topic', select: 'title description' })
            .sort({ lastStudiedAt: -1 });
        const validProgress = progress.filter((p) => {
            const course = p.course;
            return course && course._id && course.isPublished !== false;
        });
        res.status(200).json({ success: true, data: validProgress });
    }
    catch (error) {
        next(error);
    }
};
exports.getContinueStudying = getContinueStudying;
const getNeedsImprovement = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: [] });
    }
    catch (error) {
        next(error);
    }
};
exports.getNeedsImprovement = getNeedsImprovement;
const submitFlashcardSession = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Flashcard feature is deprecated.' });
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
