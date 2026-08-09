"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCourseIdFromTopicParam = exports.resolveCourseIdFromParam = exports.requireCourseAccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = __importDefault(require("../models/course.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const subscription_util_1 = require("../utils/subscription.util");
/**
 * Gates a route to users who can access a given course: it's free, they hold an
 * active subscription, or they have a successful one-off purchase for it.
 * `resolveCourseId` extracts the course id from the request (e.g. req.params.courseId,
 * or a lookup via a topic/lesson id) since the id isn't always directly on the URL.
 */
const requireCourseAccess = (resolveCourseId) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (user.role === 'admin') {
                next();
                return;
            }
            const courseId = await resolveCourseId(req);
            if (!courseId || !mongoose_1.default.isValidObjectId(courseId)) {
                res.status(404).json({ success: false, message: 'Course not found.' });
                return;
            }
            const course = await course_model_1.default.findById(courseId).select('isFree');
            if (!course) {
                res.status(404).json({ success: false, message: 'Course not found.' });
                return;
            }
            if (course.isFree) {
                next();
                return;
            }
            const subscription = await subscription_model_1.default.findOne({ user: user._id }).select('status currentPeriodEnd');
            if ((0, subscription_util_1.isSubscriptionActive)(subscription)) {
                next();
                return;
            }
            const purchased = await transaction_model_1.default.exists({
                user: user._id,
                course: courseId,
                type: 'course_purchase',
                status: 'success',
            });
            if (purchased) {
                next();
                return;
            }
            res.status(403).json({
                success: false,
                message: 'This course requires a purchase or an active subscription.',
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireCourseAccess = requireCourseAccess;
const resolveCourseIdFromParam = (paramName = 'courseId') => (req) => req.params[paramName] || null;
exports.resolveCourseIdFromParam = resolveCourseIdFromParam;
const resolveCourseIdFromTopicParam = (paramName = 'topicId') => async (req) => {
    const topic = await topic_model_1.default.findById(req.params[paramName]).select('course');
    return topic ? String(topic.course) : null;
};
exports.resolveCourseIdFromTopicParam = resolveCourseIdFromTopicParam;
