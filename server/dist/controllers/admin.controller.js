"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getUserGrowth = exports.getCoursePerformance = exports.getAnalytics = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const studySession_model_1 = __importDefault(require("../models/studySession.model"));
const getAnalytics = async (req, res, next) => {
    try {
        const [totalUsers, totalCourses, totalTopics, totalFlashcards, totalMcqs, activeSessions] = await Promise.all([
            user_model_1.default.countDocuments(),
            course_model_1.default.countDocuments(),
            topic_model_1.default.countDocuments(),
            flashcard_model_1.default.countDocuments(),
            mcq_model_1.default.countDocuments(),
            studySession_model_1.default.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        ]);
        res.status(200).json({
            success: true,
            data: { totalUsers, totalCourses, totalTopics, totalFlashcards, totalMcqs, activeSessions },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalytics = getAnalytics;
const getCoursePerformance = async (req, res, next) => {
    try {
        const courses = await course_model_1.default.find()
            .populate({ path: 'topicCount' })
            .lean();
        const performance = await Promise.all(courses.map(async (course) => {
            const sessions = await studySession_model_1.default.find({ course: course._id });
            const mcqSessions = sessions.filter((s) => s.type === 'mcq');
            const avgScore = mcqSessions.length > 0
                ? Math.round(mcqSessions.reduce((sum, s) => sum + s.score, 0) / mcqSessions.length)
                : 0;
            const enrolledUsers = await studySession_model_1.default.distinct('user', { course: course._id });
            const topics = await topic_model_1.default.find({ course: course._id }).select('_id');
            const topicIds = topics.map((t) => t._id);
            const flashcardCount = await flashcard_model_1.default.countDocuments({ topic: { $in: topicIds } });
            const mcqCount = await mcq_model_1.default.countDocuments({ topic: { $in: topicIds } });
            return {
                courseId: course._id,
                title: course.title,
                category: course.category,
                enrollment: enrolledUsers.length,
                avgScore,
                topicCount: course.topicCount || 0,
                flashcardCount,
                mcqCount,
            };
        }));
        res.status(200).json({ success: true, data: performance });
    }
    catch (error) {
        next(error);
    }
};
exports.getCoursePerformance = getCoursePerformance;
const getUserGrowth = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const growth = await user_model_1.default.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    date: { $first: '$createdAt' },
                },
            },
            { $sort: { date: 1 } },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' },
                    },
                    count: 1,
                },
            },
        ]);
        res.status(200).json({ success: true, data: growth });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserGrowth = getUserGrowth;
const getRecentActivity = async (req, res, next) => {
    try {
        const sessions = await studySession_model_1.default.find()
            .populate({ path: 'user', select: 'name firstName lastName' })
            .populate({ path: 'course', select: 'title' })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: sessions });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecentActivity = getRecentActivity;
