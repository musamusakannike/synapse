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
exports.ExerciseSchema = exports.QuestionSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.QuestionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['mcq', 'fill_in_blank', 'code_execution'],
        required: true,
    },
    question: { type: String, required: true, trim: true },
    options: [{ type: String, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, default: '', trim: true },
    starterCode: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    xp: { type: Number, default: 20, min: 0 },
}, { _id: true });
exports.ExerciseSchema = new mongoose_1.Schema({
    title: { type: String, default: '' },
    instructions: { type: String, default: '' },
    questions: [exports.QuestionSchema],
}, { _id: false });
const ChapterSchema = new mongoose_1.Schema({
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
    order: {
        type: Number,
        default: 0,
    },
    exercise: {
        type: exports.ExerciseSchema,
        default: undefined,
    },
}, {
    timestamps: true,
});
ChapterSchema.virtual('topics', {
    ref: 'Topic',
    localField: '_id',
    foreignField: 'chapter',
});
ChapterSchema.set('toJSON', { virtuals: true });
ChapterSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Chapter', ChapterSchema);
