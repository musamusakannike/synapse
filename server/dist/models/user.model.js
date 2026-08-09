"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        select: false,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        default: '',
        trim: true,
    },
    lastName: {
        type: String,
        default: '',
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    firebaseUid: {
        type: String,
        sparse: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    settings: {
        emailNotifications: { type: Boolean, default: true },
        // Opt-in is enforced by the OS permission prompt, so defaulting this to
        // false silently suppressed every push for users who had already granted
        // permission. The app-level toggle is a way to opt back *out*.
        pushNotifications: { type: Boolean, default: true },
        weeklyProgress: { type: Boolean, default: true },
        language: { type: String, default: 'en' },
        studyReminders: { type: Boolean, default: true },
        streakAlerts: { type: Boolean, default: true },
        reminderHour: { type: Number, default: 19, min: 0, max: 23 },
        reminderMinute: { type: Number, default: 0, min: 0, max: 59 },
        timezoneOffset: { type: Number, default: 0, min: -840, max: 840 },
        dailyGoalMinutes: { type: Number, default: 15, min: 1, max: 480 },
    },
    expoPushToken: {
        type: String,
        default: '',
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    lastStudyDate: {
        type: Date,
        default: null,
    },
    totalStudyDays: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('User', UserSchema);
