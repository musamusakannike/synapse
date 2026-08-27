"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChapter = exports.updateChapter = exports.createChapter = exports.getChaptersByCourse = void 0;
const chapter_model_1 = __importDefault(require("../models/chapter.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const userProgress_model_1 = __importDefault(require("../models/userProgress.model"));
const getChaptersByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id;
        const chapters = await chapter_model_1.default.find({ course: courseId }).sort({ order: 1 });
        const topics = await topic_model_1.default.find({ course: courseId }).sort({ order: 1 });
        let userProgress = null;
        if (userId) {
            userProgress = await userProgress_model_1.default.findOne({ user: userId, course: courseId });
        }
        const completedTopicIds = new Set((userProgress?.completedTopics || []).map((id) => id.toString()));
        const passedExerciseIds = new Set(userProgress?.passedExercises || []);
        // Helper to check if a topic is completed/passed
        const isTopicDone = (t) => {
            const topicIdStr = t._id.toString();
            if (completedTopicIds.has(topicIdStr))
                return true;
            if (t.exercise && t.exercise.questions && t.exercise.questions.length > 0) {
                return passedExerciseIds.has(`topic_${topicIdStr}`);
            }
            return false;
        };
        // Calculate lock/unlock status sequentially across chapters and topics
        let previousTopicCompleted = true; // First topic of first chapter starts unlocked!
        let previousChapterCompleted = true; // First chapter starts unlocked!
        const chaptersWithStatus = chapters.map((chapter, chapterIdx) => {
            const chapterTopics = topics.filter((t) => t.chapter?.toString() === chapter._id.toString() || (chapterIdx === 0 && !t.chapter));
            const isChapterUnlocked = chapterIdx === 0 ? true : previousChapterCompleted;
            let chapterCompletedCount = 0;
            const topicsWithStatus = chapterTopics.map((topic, topicIdx) => {
                const topicIdStr = topic._id.toString();
                const isCompleted = completedTopicIds.has(topicIdStr) || passedExerciseIds.has(`topic_${topicIdStr}`);
                let isUnlocked = false;
                if (!isChapterUnlocked) {
                    isUnlocked = false;
                }
                else if (topicIdx === 0) {
                    isUnlocked = true;
                }
                else {
                    isUnlocked = previousTopicCompleted;
                }
                if (isCompleted) {
                    chapterCompletedCount++;
                }
                previousTopicCompleted = isCompleted;
                return {
                    ...topic.toObject(),
                    isUnlocked,
                    isCompleted,
                    inProgress: userProgress?.lastTopic?.toString() === topicIdStr,
                };
            });
            const totalTopicsInChapter = chapterTopics.length;
            const chapterPercent = totalTopicsInChapter > 0 ? Math.round((chapterCompletedCount / totalTopicsInChapter) * 100) : 0;
            const isChapterCompleted = totalTopicsInChapter > 0 && chapterCompletedCount === totalTopicsInChapter;
            previousChapterCompleted = isChapterCompleted;
            let status = 'locked';
            if (!isChapterUnlocked) {
                status = 'locked';
            }
            else if (isChapterCompleted) {
                status = 'completed';
            }
            else {
                status = 'inprogress';
            }
            return {
                ...chapter.toObject(),
                status,
                progressPercent: chapterPercent,
                topics: topicsWithStatus,
            };
        });
        res.status(200).json({
            success: true,
            data: chaptersWithStatus,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChaptersByCourse = getChaptersByCourse;
const createChapter = async (req, res, next) => {
    try {
        const { course, title, description, order, exercise } = req.body;
        const chapter = await chapter_model_1.default.create({ course, title, description, order, exercise });
        res.status(201).json({ success: true, data: chapter });
    }
    catch (error) {
        next(error);
    }
};
exports.createChapter = createChapter;
const updateChapter = async (req, res, next) => {
    try {
        const { title, description, order, exercise } = req.body;
        const chapter = await chapter_model_1.default.findByIdAndUpdate(req.params.id, { title, description, order, exercise }, { new: true, runValidators: true });
        if (!chapter) {
            res.status(404).json({ success: false, message: 'Chapter not found.' });
            return;
        }
        res.status(200).json({ success: true, data: chapter });
    }
    catch (error) {
        next(error);
    }
};
exports.updateChapter = updateChapter;
const deleteChapter = async (req, res, next) => {
    try {
        const chapter = await chapter_model_1.default.findByIdAndDelete(req.params.id);
        if (!chapter) {
            res.status(404).json({ success: false, message: 'Chapter not found.' });
            return;
        }
        await topic_model_1.default.deleteMany({ chapter: req.params.id });
        res.status(200).json({ success: true, message: 'Chapter deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteChapter = deleteChapter;
