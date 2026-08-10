"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHistory = exports.getHistoryById = exports.getHistory = exports.generateTopicQuiz = exports.generateCourseQuiz = exports.qa = exports.generateFlashcards = exports.generateQuiz = exports.summarize = void 0;
const deepseek_service_1 = require("../services/deepseek.service");
const aiHistory_model_1 = __importDefault(require("../models/aiHistory.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
/**
 * Helper to handle SSE streaming setup or standard JSON output.
 */
function isStreamRequested(req) {
    if (req.body.stream === false)
        return false;
    return true; // Default to streaming for AI endpoints
}
function setupSSEHeaders(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Flush headers if method is available
    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }
}
/**
 * POST /api/v1/ai/summarize
 */
const summarize = async (req, res, next) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const stream = isStreamRequested(req);
        if (stream) {
            setupSSEHeaders(res);
            let accumulated = '';
            await deepseek_service_1.DeepSeekService.summarize(text, (chunk) => {
                accumulated += chunk;
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'summarize',
                title: `Summary: ${text.slice(0, 30)}...`,
                prompt: text,
                result: accumulated,
            });
            res.write(`data: ${JSON.stringify({
                done: true,
                historyId: history._id,
                result: accumulated,
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
            const result = await deepseek_service_1.DeepSeekService.summarize(text);
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'summarize',
                title: `Summary: ${text.slice(0, 30)}...`,
                prompt: text,
                result,
            });
            res.status(200).json({
                success: true,
                data: {
                    historyId: history._id,
                    type: history.type,
                    prompt: history.prompt,
                    result,
                    createdAt: history.createdAt,
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.summarize = summarize;
/**
 * POST /api/v1/ai/generate-quiz
 */
const generateQuiz = async (req, res, next) => {
    try {
        const { topic, count = 3 } = req.body;
        const userId = req.user._id;
        const stream = isStreamRequested(req);
        if (stream) {
            setupSSEHeaders(res);
            const questions = await deepseek_service_1.DeepSeekService.generateQuiz(topic, count, (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'quiz',
                title: `Quiz: ${topic}`,
                prompt: topic,
                metadata: { count },
                result: questions,
            });
            res.write(`data: ${JSON.stringify({
                done: true,
                historyId: history._id,
                result: questions,
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
            const questions = await deepseek_service_1.DeepSeekService.generateQuiz(topic, count);
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'quiz',
                title: `Quiz: ${topic}`,
                prompt: topic,
                metadata: { count },
                result: questions,
            });
            res.status(200).json({
                success: true,
                data: {
                    historyId: history._id,
                    type: history.type,
                    prompt: history.prompt,
                    result: questions,
                    createdAt: history.createdAt,
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.generateQuiz = generateQuiz;
/**
 * POST /api/v1/ai/generate-flashcards
 */
const generateFlashcards = async (req, res, next) => {
    try {
        const { topic, count = 3 } = req.body;
        const userId = req.user._id;
        const stream = isStreamRequested(req);
        if (stream) {
            setupSSEHeaders(res);
            const flashcards = await deepseek_service_1.DeepSeekService.generateFlashcards(topic, count, (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'flashcards',
                title: `Flashcards: ${topic}`,
                prompt: topic,
                metadata: { count },
                result: flashcards,
            });
            res.write(`data: ${JSON.stringify({
                done: true,
                historyId: history._id,
                result: flashcards,
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
            const flashcards = await deepseek_service_1.DeepSeekService.generateFlashcards(topic, count);
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'flashcards',
                title: `Flashcards: ${topic}`,
                prompt: topic,
                metadata: { count },
                result: flashcards,
            });
            res.status(200).json({
                success: true,
                data: {
                    historyId: history._id,
                    type: history.type,
                    prompt: history.prompt,
                    result: flashcards,
                    createdAt: history.createdAt,
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.generateFlashcards = generateFlashcards;
/**
 * POST /api/v1/ai/qa
 */
const qa = async (req, res, next) => {
    try {
        const { question, context } = req.body;
        const userId = req.user._id;
        const stream = isStreamRequested(req);
        if (stream) {
            setupSSEHeaders(res);
            let accumulated = '';
            await deepseek_service_1.DeepSeekService.askQA(question, context, (chunk) => {
                accumulated += chunk;
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'qa',
                title: `Q&A: ${question.slice(0, 30)}...`,
                prompt: question,
                metadata: { context },
                result: accumulated,
            });
            res.write(`data: ${JSON.stringify({
                done: true,
                historyId: history._id,
                result: accumulated,
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
            const result = await deepseek_service_1.DeepSeekService.askQA(question, context);
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'qa',
                title: `Q&A: ${question.slice(0, 30)}...`,
                prompt: question,
                metadata: { context },
                result,
            });
            res.status(200).json({
                success: true,
                data: {
                    historyId: history._id,
                    type: history.type,
                    prompt: history.prompt,
                    result,
                    createdAt: history.createdAt,
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.qa = qa;
/**
 * POST /api/v1/ai/courses/:courseId/quiz
 */
const generateCourseQuiz = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { count = 5, difficulty = 'medium' } = req.body;
        const userId = req.user._id;
        const stream = isStreamRequested(req);
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const topics = await topic_model_1.default.find({ course: courseId }).select('title description');
        const topicsSummary = topics.map((t) => `- ${t.title}: ${t.description}`).join('\n');
        const contextDescription = `Description: ${course.description}\nCategory: ${course.category}\nDifficulty: ${course.difficulty}\nTopics:\n${topicsSummary}`;
        if (stream) {
            setupSSEHeaders(res);
            const questions = await deepseek_service_1.DeepSeekService.generateQuizForContext('course', course.title, contextDescription, count, difficulty, (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'course_quiz',
                title: `Course Quiz: ${course.title}`,
                prompt: `Generate ${count} ${difficulty} quiz questions for course: ${course.title}`,
                metadata: { courseId: course._id, courseTitle: course.title, count, difficulty },
                result: questions,
            });
            res.write(`data: ${JSON.stringify({
                done: true,
                historyId: history._id,
                result: questions,
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
            const questions = await deepseek_service_1.DeepSeekService.generateQuizForContext('course', course.title, contextDescription, count, difficulty);
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'course_quiz',
                title: `Course Quiz: ${course.title}`,
                prompt: `Generate ${count} ${difficulty} quiz questions for course: ${course.title}`,
                metadata: { courseId: course._id, courseTitle: course.title, count, difficulty },
                result: questions,
            });
            res.status(200).json({
                success: true,
                data: {
                    historyId: history._id,
                    type: history.type,
                    prompt: history.prompt,
                    result: questions,
                    createdAt: history.createdAt,
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.generateCourseQuiz = generateCourseQuiz;
/**
 * POST /api/v1/ai/topics/:topicId/quiz
 */
const generateTopicQuiz = async (req, res, next) => {
    try {
        const { topicId } = req.params;
        const { count = 3, difficulty = 'medium' } = req.body;
        const userId = req.user._id;
        const stream = isStreamRequested(req);
        const topic = await topic_model_1.default.findById(topicId);
        if (!topic) {
            res.status(404).json({ success: false, message: 'Topic not found.' });
            return;
        }
        const textContentBlocks = topic.contents
            .filter((c) => c.type === 'text' || c.type === 'latex' || c.type === 'code')
            .map((c) => c.content)
            .join('\n\n');
        const contextDescription = `Description: ${topic.description}\nContent:\n${textContentBlocks || topic.description}`;
        if (stream) {
            setupSSEHeaders(res);
            const questions = await deepseek_service_1.DeepSeekService.generateQuizForContext('topic', topic.title, contextDescription, count, difficulty, (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            });
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'topic_quiz',
                title: `Topic Quiz: ${topic.title}`,
                prompt: `Generate ${count} ${difficulty} quiz questions for topic: ${topic.title}`,
                metadata: {
                    topicId: topic._id,
                    topicTitle: topic.title,
                    courseId: topic.course,
                    count,
                    difficulty,
                },
                result: questions,
            });
            res.write(`data: ${JSON.stringify({
                done: true,
                historyId: history._id,
                result: questions,
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
        else {
            const questions = await deepseek_service_1.DeepSeekService.generateQuizForContext('topic', topic.title, contextDescription, count, difficulty);
            const history = await aiHistory_model_1.default.create({
                user: userId,
                type: 'topic_quiz',
                title: `Topic Quiz: ${topic.title}`,
                prompt: `Generate ${count} ${difficulty} quiz questions for topic: ${topic.title}`,
                metadata: {
                    topicId: topic._id,
                    topicTitle: topic.title,
                    courseId: topic.course,
                    count,
                    difficulty,
                },
                result: questions,
            });
            res.status(200).json({
                success: true,
                data: {
                    historyId: history._id,
                    type: history.type,
                    prompt: history.prompt,
                    result: questions,
                    createdAt: history.createdAt,
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.generateTopicQuiz = generateTopicQuiz;
/**
 * GET /api/v1/ai/history
 */
const getHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type, page = 1, limit = 10 } = req.query;
        const query = { user: userId };
        if (type && typeof type === 'string') {
            query.type = type;
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            aiHistory_model_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            aiHistory_model_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            data: items,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
/**
 * GET /api/v1/ai/history/:id
 */
const getHistoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const item = await aiHistory_model_1.default.findOne({ _id: id, user: userId });
        if (!item) {
            res.status(404).json({ success: false, message: 'AI generation history item not found.' });
            return;
        }
        res.status(200).json({
            success: true,
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHistoryById = getHistoryById;
/**
 * DELETE /api/v1/ai/history/:id
 */
const deleteHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const deleted = await aiHistory_model_1.default.findOneAndDelete({ _id: id, user: userId });
        if (!deleted) {
            res.status(404).json({ success: false, message: 'AI generation history item not found.' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'AI generation history item deleted successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteHistory = deleteHistory;
