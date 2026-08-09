"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateFlashcards = exports.deleteFlashcard = exports.updateFlashcard = exports.createFlashcard = exports.getFlashcardsByTopic = void 0;
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const getFlashcardsByTopic = async (req, res, next) => {
    try {
        const flashcards = await flashcard_model_1.default.find({ topic: req.params.topicId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: flashcards });
    }
    catch (error) {
        next(error);
    }
};
exports.getFlashcardsByTopic = getFlashcardsByTopic;
const createFlashcard = async (req, res, next) => {
    try {
        const flashcard = await flashcard_model_1.default.create(req.body);
        res.status(201).json({ success: true, data: flashcard });
    }
    catch (error) {
        next(error);
    }
};
exports.createFlashcard = createFlashcard;
const updateFlashcard = async (req, res, next) => {
    try {
        const flashcard = await flashcard_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!flashcard) {
            res.status(404).json({ success: false, message: 'Flashcard not found.' });
            return;
        }
        res.status(200).json({ success: true, data: flashcard });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFlashcard = updateFlashcard;
const deleteFlashcard = async (req, res, next) => {
    try {
        const flashcard = await flashcard_model_1.default.findByIdAndDelete(req.params.id);
        if (!flashcard) {
            res.status(404).json({ success: false, message: 'Flashcard not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Flashcard deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFlashcard = deleteFlashcard;
const bulkCreateFlashcards = async (req, res, next) => {
    try {
        const { topic, flashcards } = req.body;
        const docs = flashcards.map((f) => ({ ...f, topic }));
        const created = await flashcard_model_1.default.insertMany(docs);
        res.status(201).json({ success: true, data: created, count: created.length });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkCreateFlashcards = bulkCreateFlashcards;
