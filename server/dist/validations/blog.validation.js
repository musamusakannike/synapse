"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateBlogPost = exports.validateCreateBlogPost = void 0;
const validateCreateBlogPost = (req, res, next) => {
    const { title, excerpt, content, category } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Blog post title is required.');
    }
    if (!excerpt || typeof excerpt !== 'string' || excerpt.trim().length === 0) {
        errors.push('Blog post excerpt is required.');
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        errors.push('Blog post content is required.');
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Blog post category is required.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateCreateBlogPost = validateCreateBlogPost;
const validateUpdateBlogPost = (req, res, next) => {
    const errors = [];
    if (req.body.title !== undefined && (typeof req.body.title !== 'string' || req.body.title.trim().length === 0)) {
        errors.push('Blog post title cannot be empty.');
    }
    if (req.body.excerpt !== undefined && (typeof req.body.excerpt !== 'string' || req.body.excerpt.trim().length === 0)) {
        errors.push('Blog post excerpt cannot be empty.');
    }
    if (req.body.content !== undefined && (typeof req.body.content !== 'string' || req.body.content.trim().length === 0)) {
        errors.push('Blog post content cannot be empty.');
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateUpdateBlogPost = validateUpdateBlogPost;
