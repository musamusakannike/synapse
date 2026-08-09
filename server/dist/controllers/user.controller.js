"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyAccount = exports.removePushToken = exports.savePushToken = exports.updateSettings = exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.uploadAvatar = exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const r2_util_1 = require("../utils/r2.util");
const getProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phone: req.user.phone,
                bio: req.user.bio,
                avatar: req.user.avatar,
                level: req.user.level,
                role: req.user.role,
                settings: req.user.settings || {
                    emailNotifications: true,
                    pushNotifications: false,
                    weeklyProgress: true,
                    language: 'en',
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, bio, level, email } = req.body;
        const updates = {};
        if (firstName !== undefined)
            updates.firstName = firstName;
        if (lastName !== undefined)
            updates.lastName = lastName;
        if (phone !== undefined)
            updates.phone = phone;
        if (bio !== undefined)
            updates.bio = bio;
        if (level !== undefined)
            updates.level = level;
        if (email !== undefined)
            updates.email = email;
        if (firstName || lastName) {
            const fn = firstName || req.user.firstName;
            const ln = lastName || req.user.lastName;
            updates.name = `${fn} ${ln}`;
        }
        const user = await user_model_1.default.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded.' });
            return;
        }
        const fileKey = `avatars/${req.user._id}-${Date.now()}-${req.file.originalname}`;
        const avatarUrl = await (0, r2_util_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
        const user = await user_model_1.default.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
        res.status(200).json({ success: true, data: { avatar: avatarUrl, user } });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadAvatar = uploadAvatar;
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        const users = await user_model_1.default.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await user_model_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res, next) => {
    try {
        const user = await user_model_1.default.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res, next) => {
    try {
        const user = await user_model_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
const updateSettings = async (req, res, next) => {
    try {
        const { emailNotifications, pushNotifications, weeklyProgress, language, studyReminders, streakAlerts, reminderHour, reminderMinute, timezoneOffset, dailyGoalMinutes, } = req.body;
        const settingsUpdate = {};
        if (emailNotifications !== undefined)
            settingsUpdate['settings.emailNotifications'] = emailNotifications;
        if (pushNotifications !== undefined)
            settingsUpdate['settings.pushNotifications'] = pushNotifications;
        if (weeklyProgress !== undefined)
            settingsUpdate['settings.weeklyProgress'] = weeklyProgress;
        if (language !== undefined)
            settingsUpdate['settings.language'] = language;
        if (studyReminders !== undefined)
            settingsUpdate['settings.studyReminders'] = studyReminders;
        if (streakAlerts !== undefined)
            settingsUpdate['settings.streakAlerts'] = streakAlerts;
        if (reminderHour !== undefined)
            settingsUpdate['settings.reminderHour'] = reminderHour;
        if (reminderMinute !== undefined)
            settingsUpdate['settings.reminderMinute'] = reminderMinute;
        if (timezoneOffset !== undefined)
            settingsUpdate['settings.timezoneOffset'] = timezoneOffset;
        if (dailyGoalMinutes !== undefined)
            settingsUpdate['settings.dailyGoalMinutes'] = dailyGoalMinutes;
        const user = await user_model_1.default.findByIdAndUpdate(req.user._id, { $set: settingsUpdate }, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: { settings: user.settings } });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSettings = updateSettings;
const savePushToken = async (req, res, next) => {
    try {
        const { token, timezoneOffset } = req.body;
        if (!token || typeof token !== 'string') {
            res.status(400).json({ success: false, message: 'Push token is required.' });
            return;
        }
        const update = { expoPushToken: token };
        // The app re-reports its offset on every launch, which is how the server
        // picks up travel and daylight-saving shifts without a timezone database.
        if (Number.isInteger(timezoneOffset) && timezoneOffset >= -840 && timezoneOffset <= 840) {
            update['settings.timezoneOffset'] = timezoneOffset;
        }
        await user_model_1.default.findByIdAndUpdate(req.user._id, { $set: update });
        res.status(200).json({ success: true, message: 'Push token saved.' });
    }
    catch (error) {
        next(error);
    }
};
exports.savePushToken = savePushToken;
const removePushToken = async (req, res, next) => {
    try {
        await user_model_1.default.findByIdAndUpdate(req.user._id, { expoPushToken: '' });
        res.status(200).json({ success: true, message: 'Push token removed.' });
    }
    catch (error) {
        next(error);
    }
};
exports.removePushToken = removePushToken;
const deleteMyAccount = async (req, res, next) => {
    try {
        const userId = req.user._id;
        await user_model_1.default.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: 'Account deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMyAccount = deleteMyAccount;
