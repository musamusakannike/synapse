"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateNotification = void 0;
const validateCreateNotification = (req, res, next) => {
    const { title, message } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Notification title is required.');
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        errors.push('Notification message is required.');
    }
    if (req.body.type && !['info', 'success', 'warning', 'announcement'].includes(req.body.type)) {
        errors.push('Type must be info, success, warning, or announcement.');
    }
    const categories = ['welcome', 'course', 'achievement', 'streak', 'reminder', 'system', 'custom'];
    if (req.body.category && !categories.includes(req.body.category)) {
        errors.push(`Category must be one of: ${categories.join(', ')}.`);
    }
    if (req.body.scheduledFor !== undefined) {
        const when = new Date(req.body.scheduledFor);
        if (Number.isNaN(when.getTime())) {
            errors.push('scheduledFor must be a valid date.');
        }
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }
    next();
};
exports.validateCreateNotification = validateCreateNotification;
