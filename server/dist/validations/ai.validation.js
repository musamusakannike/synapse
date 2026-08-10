"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTopicQuiz = exports.validateCourseQuiz = exports.validateQA = exports.validateGenerateFlashcards = exports.validateGenerateQuiz = exports.validateSummarize = void 0;
const validateSummarize = (req, res, next) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Text content is required for summarization.' });
        return;
    }
    next();
};
exports.validateSummarize = validateSummarize;
const validateGenerateQuiz = (req, res, next) => {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Topic is required to generate quiz questions.' });
        return;
    }
    next();
};
exports.validateGenerateQuiz = validateGenerateQuiz;
const validateGenerateFlashcards = (req, res, next) => {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Topic is required to generate flashcards.' });
        return;
    }
    next();
};
exports.validateGenerateFlashcards = validateGenerateFlashcards;
const validateQA = (req, res, next) => {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Question string is required.' });
        return;
    }
    next();
};
exports.validateQA = validateQA;
const validateCourseQuiz = (req, res, next) => {
    const { count, difficulty } = req.body;
    const errors = [];
    if (count !== undefined && (typeof count !== 'number' || count < 1 || count > 20)) {
        errors.push('Count must be a number between 1 and 20.');
    }
    if (difficulty !== undefined && !['easy', 'medium', 'hard'].includes(difficulty)) {
        errors.push('Difficulty must be one of: easy, medium, hard.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateCourseQuiz = validateCourseQuiz;
const validateTopicQuiz = (req, res, next) => {
    const { count, difficulty } = req.body;
    const errors = [];
    if (count !== undefined && (typeof count !== 'number' || count < 1 || count > 20)) {
        errors.push('Count must be a number between 1 and 20.');
    }
    if (difficulty !== undefined && !['easy', 'medium', 'hard'].includes(difficulty)) {
        errors.push('Difficulty must be one of: easy, medium, hard.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateTopicQuiz = validateTopicQuiz;
