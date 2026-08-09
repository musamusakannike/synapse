"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBulkCreateFlashcards = exports.validateUpdateFlashcard = exports.validateCreateFlashcard = void 0;
const validateCreateFlashcard = (req, res, next) => {
    const { topic, question, answer } = req.body;
    const errors = [];
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        errors.push('Question is required.');
    }
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
        errors.push('Answer is required.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateCreateFlashcard = validateCreateFlashcard;
const validateUpdateFlashcard = (req, res, next) => {
    const errors = [];
    if (req.body.question !== undefined && (typeof req.body.question !== 'string' || req.body.question.trim().length === 0)) {
        errors.push('Question cannot be empty.');
    }
    if (req.body.answer !== undefined && (typeof req.body.answer !== 'string' || req.body.answer.trim().length === 0)) {
        errors.push('Answer cannot be empty.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateUpdateFlashcard = validateUpdateFlashcard;
const validateBulkCreateFlashcards = (req, res, next) => {
    const { topic, flashcards } = req.body;
    const errors = [];
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
        errors.push('Flashcards array is required and must not be empty.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateBulkCreateFlashcards = validateBulkCreateFlashcards;
