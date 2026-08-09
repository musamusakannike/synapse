"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateCourse = exports.validateCreateCourse = void 0;
const validateCreateCourse = (req, res, next) => {
    const { title, description, category } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Course title is required.');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Course description is required.');
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Course category is required.');
    }
    if (req.body.difficulty && !['beginner', 'intermediate', 'advanced'].includes(req.body.difficulty)) {
        errors.push('Difficulty must be beginner, intermediate, or advanced.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateCreateCourse = validateCreateCourse;
const validateUpdateCourse = (req, res, next) => {
    const errors = [];
    if (req.body.title !== undefined && (typeof req.body.title !== 'string' || req.body.title.trim().length === 0)) {
        errors.push('Course title cannot be empty.');
    }
    if (req.body.description !== undefined && (typeof req.body.description !== 'string' || req.body.description.trim().length === 0)) {
        errors.push('Course description cannot be empty.');
    }
    if (req.body.difficulty && !['beginner', 'intermediate', 'advanced'].includes(req.body.difficulty)) {
        errors.push('Difficulty must be beginner, intermediate, or advanced.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateUpdateCourse = validateUpdateCourse;
