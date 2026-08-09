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
const TopicQuizOptionSchema = new mongoose_1.Schema({
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
}, { _id: false });
const TopicQuizSchema = new mongoose_1.Schema({
    question: { type: String, required: true, trim: true },
    options: { type: [TopicQuizOptionSchema], default: undefined },
    explanation: { type: String, default: '', trim: true },
}, { _id: false });
const TopicExerciseSchema = new mongoose_1.Schema({
    instructions: { type: String, required: true, trim: true },
    starterCode: { type: String, default: '' },
    language: { type: String, default: 'python' },
    expectedOutput: { type: String, default: '' },
    solution: { type: String, default: '' },
}, { _id: false });
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
        type: TopicQuizSchema,
        default: undefined,
    },
    exercise: {
        type: TopicExerciseSchema,
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
    order: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    defaultFlow: {
        type: String,
        enum: ['flat', 'guided'],
        default: 'flat',
    },
}, {
    timestamps: true,
});
TopicSchema.virtual('flashcardCount', {
    ref: 'Flashcard',
    localField: '_id',
    foreignField: 'topic',
    count: true,
});
TopicSchema.virtual('mcqCount', {
    ref: 'MCQ',
    localField: '_id',
    foreignField: 'topic',
    count: true,
});
TopicSchema.set('toJSON', { virtuals: true });
TopicSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Topic', TopicSchema);
