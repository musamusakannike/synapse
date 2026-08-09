"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = void 0;
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    if (req.query.page && (isNaN(page) || page < 1)) {
        res.status(400).json({ success: false, errors: ['Page must be a positive integer.'] });
        return;
    }
    if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
        res.status(400).json({ success: false, errors: ['Limit must be a positive integer between 1 and 100.'] });
        return;
    }
    next();
};
exports.validatePagination = validatePagination;
