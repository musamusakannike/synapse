"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const globalSearch = async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();
        const type = req.query.type || 'all';
        const limit = 5;
        if (!q) {
            res.status(200).json({ success: true, data: { courses: [], topics: [], flashcards: [], mcqs: [] } });
            return;
        }
        const regex = new RegExp(q, 'i');
        const results = {
            courses: [],
            topics: [],
            flashcards: [],
            mcqs: [],
        };
        if (type === 'all' || type === 'courses') {
            results.courses = await course_model_1.default.find({
                isPublished: true,
                $or: [{ title: regex }, { description: regex }],
            })
                .select('title description category difficulty')
                .limit(limit)
                .lean();
        }
        if (type === 'all' || type === 'topics') {
            results.topics = await topic_model_1.default.find({
                $or: [{ title: regex }, { description: regex }],
            })
                .populate({ path: 'course', select: 'title' })
                .select('title course')
                .limit(limit)
                .lean();
        }
        if (type === 'all' || type === 'flashcards') {
            results.flashcards = await flashcard_model_1.default.find({ question: regex })
                .populate({ path: 'topic', select: 'title' })
                .select('question topic')
                .limit(limit)
                .lean();
        }
        if (type === 'all' || type === 'mcqs') {
            results.mcqs = await mcq_model_1.default.find({ question: regex })
                .populate({ path: 'topic', select: 'title' })
                .select('question topic')
                .limit(limit)
                .lean();
        }
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        next(error);
    }
};
exports.globalSearch = globalSearch;
