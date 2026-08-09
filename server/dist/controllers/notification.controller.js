"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.createNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const notification_service_1 = require("../services/notification.service");
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // Anything still queued for a future send must stay hidden until it fires,
        // or a scheduled maintenance warning shows up in the list days early.
        const notifications = await notification_model_1.default.find({
            $or: [{ user: userId }, { user: null }],
            $and: [{ $or: [{ scheduledFor: null }, { scheduledFor: { $lte: new Date() } }] }],
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found.' });
            return;
        }
        res.status(200).json({ success: true, data: notification });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id;
        await notification_model_1.default.updateMany({ $or: [{ user: userId }, { user: null }], isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
const createNotification = async (req, res, next) => {
    try {
        const { user, type, category, title, message, actionUrl, data, dedupeKey, scheduledFor } = req.body;
        const result = await (0, notification_service_1.notify)({
            user: user || null,
            type,
            category: category || 'system',
            title,
            message,
            actionUrl,
            data,
            dedupeKey,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        });
        if (!result.notification) {
            res.status(500).json({ success: false, message: 'Failed to create notification.' });
            return;
        }
        if (!result.created) {
            res.status(409).json({
                success: false,
                message: 'A notification with this dedupeKey already exists.',
                data: result.notification,
            });
            return;
        }
        res.status(201).json({
            success: true,
            data: result.notification,
            delivered: result.delivered,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createNotification = createNotification;
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findByIdAndDelete(req.params.id);
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
