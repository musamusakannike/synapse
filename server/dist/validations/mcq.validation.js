"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBulkCreateMcqs = exports.validateUpdateMcq = exports.validateCreateMcq = void 0;
const validateCreateMcq = (req, res, next) => {
    const { topic, question, options } = req.body;
    const errors = [];
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        errors.push('Question is required.');
    }
    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
        errors.push('Options must have between 2 and 6 entries.');
    }
    else {
        const hasCorrect = options.some((opt) => opt.isCorrect === true);
        if (!hasCorrect) {
            errors.push('At least one option must be marked as correct.');
        }
        for (const opt of options) {
            if (!opt.text || typeof opt.text !== 'string' || opt.text.trim().length === 0) {
                errors.push('Each option must have non-empty text.');
                break;
            }
        }
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateCreateMcq = validateCreateMcq;
const validateUpdateMcq = (req, res, next) => {
    const errors = [];
    if (req.body.question !== undefined && (typeof req.body.question !== 'string' || req.body.question.trim().length === 0)) {
        errors.push('Question cannot be empty.');
    }
    if (req.body.options !== undefined) {
        if (!Array.isArray(req.body.options) || req.body.options.length < 2 || req.body.options.length > 6) {
            errors.push('Options must have between 2 and 6 entries.');
        }
        else {
            const hasCorrect = req.body.options.some((opt) => opt.isCorrect === true);
            if (!hasCorrect) {
                errors.push('At least one option must be marked as correct.');
            }
        }
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateUpdateMcq = validateUpdateMcq;
const validateBulkCreateMcqs = (req, res, next) => {
    const { topic, mcqs } = req.body;
    const errors = [];
    if (!topic || typeof topic !== 'string') {
        errors.push('Topic ID is required.');
    }
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
        errors.push('MCQs array is required and must not be empty.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateBulkCreateMcqs = validateBulkCreateMcqs;
