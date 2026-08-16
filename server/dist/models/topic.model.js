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
const chapter_model_1 = require("./chapter.model");
const TopicContentSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['text', 'latex', 'youtube', 'image', 'video', 'audio', 'code', 'quiz', 'exercise', 'group'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: undefined,
    },
    title: {
        type: String,
        default: undefined,
    },
    quiz: {
        type: mongoose_1.Schema.Types.Mixed,
        default: undefined,
    },
    exercise: {
        type: mongoose_1.Schema.Types.Mixed,
        default: undefined,
    },
    blocks: {
        type: [mongoose_1.Schema.Types.Mixed],
        default: undefined,
    },
}, { _id: true });
const TopicSchema = new mongoose_1.Schema({
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true,
    },
    chapter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: false,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    contents: [TopicContentSchema],
    exercise: {
        type: chapter_model_1.ExerciseSchema,
        default: undefined,
    },
    xp: {
        type: Number,
        default: 50,
        min: 0,
    },
    order: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
TopicSchema.set('toJSON', { virtuals: true });
TopicSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Topic', TopicSchema);
