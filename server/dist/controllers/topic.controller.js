"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopic = exports.updateTopic = exports.createTopic = exports.getTopicById = exports.getTopicsByCourse = exports.reorderTopics = void 0;
const topic_model_1 = __importDefault(require("../models/topic.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const userProgress_model_1 = __importDefault(require("../models/userProgress.model"));
const reorderTopics = async (req, res, next) => {
    try {
        const topicIds = req.body.topicIds || req.body.order;
        const { chapterId } = req.body;
        if (!Array.isArray(topicIds) || topicIds.length === 0) {
            res.status(400).json({ success: false, message: 'topicIds or order array is required.' });
            return;
        }
        await Promise.all(topicIds.map((id, index) => {
            const updateData = { order: index };
            if (chapterId !== undefined) {
                updateData.chapter = chapterId || null;
            }
            return topic_model_1.default.findByIdAndUpdate(id, updateData);
        }));
        res.status(200).json({ success: true, message: 'Topics reordered successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.reorderTopics = reorderTopics;
const getTopicsByCourse = async (req, res, next) => {
    try {
        const topics = await topic_model_1.default.find({ course: req.params.courseId })
            .populate({ path: 'flashcardCount' })
            .populate({ path: 'mcqCount' })
            .sort({ order: 1, createdAt: 1 });
        res.status(200).json({ success: true, data: topics });
    }
    catch (error) {
        next(error);
    }
};
exports.getTopicsByCourse = getTopicsByCourse;
const getTopicById = async (req, res, next) => {
    try {
        const topic = await topic_model_1.default.findById(req.params.id)
            .populate({ path: 'flashcardCount' })
            .populate({ path: 'mcqCount' });
        if (!topic) {
            res.status(404).json({ success: false, message: 'Topic not found.' });
            return;
        }
        res.status(200).json({ success: true, data: topic });
    }
    catch (error) {
        next(error);
    }
};
exports.getTopicById = getTopicById;
const createTopic = async (req, res, next) => {
    try {
        const topic = await topic_model_1.default.create(req.body);
        res.status(201).json({ success: true, data: topic });
    }
    catch (error) {
        next(error);
    }
};
exports.createTopic = createTopic;
const updateTopic = async (req, res, next) => {
    try {
        const topic = await topic_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!topic) {
            res.status(404).json({ success: false, message: 'Topic not found.' });
            return;
        }
        res.status(200).json({ success: true, data: topic });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTopic = updateTopic;
const deleteTopic = async (req, res, next) => {
    try {
        const topic = await topic_model_1.default.findByIdAndDelete(req.params.id);
        if (!topic) {
            res.status(404).json({ success: false, message: 'Topic not found.' });
            return;
        }
        await flashcard_model_1.default.deleteMany({ topic: req.params.id });
        await mcq_model_1.default.deleteMany({ topic: req.params.id });
        await userProgress_model_1.default.deleteMany({ topic: req.params.id });
        res.status(200).json({ success: true, message: 'Topic deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTopic = deleteTopic;
