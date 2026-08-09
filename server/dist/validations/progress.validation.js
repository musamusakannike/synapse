"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMcqSession = exports.validateContentPosition = exports.validateFlashcardSession = void 0;
const validateFlashcardSession = (req, res, next) => {
    const { course, topic, flashcardsStudied, duration } = req.body;
    const errors = [];
    if (!course || typeof course !== 'string') {
        errors.push('Course ID is required.');
    }
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (flashcardsStudied === undefined || typeof flashcardsStudied !== 'number' || flashcardsStudied < 0) {
        errors.push('flashcardsStudied must be a non-negative number.');
    }
    if (duration === undefined || typeof duration !== 'number' || duration < 0) {
        errors.push('duration must be a non-negative number (seconds).');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateFlashcardSession = validateFlashcardSession;
const validateContentPosition = (req, res, next) => {
    const { course, topic, contentIndex } = req.body;
    const errors = [];
    if (!course || typeof course !== 'string') {
        errors.push('Course ID is required.');
    }
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (contentIndex === undefined || !Number.isInteger(contentIndex) || contentIndex < 0) {
        errors.push('contentIndex must be a non-negative integer.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateContentPosition = validateContentPosition;
const validateMcqSession = (req, res, next) => {
    const { course, topic, mcqAnswered, mcqCorrect, score, duration } = req.body;
    const errors = [];
    if (!course || typeof course !== 'string') {
        errors.push('Course ID is required.');
    }
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (mcqAnswered === undefined || typeof mcqAnswered !== 'number' || mcqAnswered < 0) {
        errors.push('mcqAnswered must be a non-negative number.');
    }
    if (mcqCorrect === undefined || typeof mcqCorrect !== 'number' || mcqCorrect < 0) {
        errors.push('mcqCorrect must be a non-negative number.');
    }
    if (score === undefined || typeof score !== 'number' || score < 0 || score > 100) {
        errors.push('score must be a number between 0 and 100.');
    }
    if (duration === undefined || typeof duration !== 'number' || duration < 0) {
        errors.push('duration must be a non-negative number (seconds).');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateMcqSession = validateMcqSession;
