"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateMcqs = exports.deleteMcq = exports.updateMcq = exports.createMcq = exports.getMcqsByTopic = void 0;
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const getMcqsByTopic = async (req, res, next) => {
    try {
        const mcqs = await mcq_model_1.default.find({ topic: req.params.topicId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: mcqs });
    }
    catch (error) {
        next(error);
    }
};
exports.getMcqsByTopic = getMcqsByTopic;
const createMcq = async (req, res, next) => {
    try {
        const mcq = await mcq_model_1.default.create(req.body);
        res.status(201).json({ success: true, data: mcq });
    }
    catch (error) {
        next(error);
    }
};
exports.createMcq = createMcq;
const updateMcq = async (req, res, next) => {
    try {
        const mcq = await mcq_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!mcq) {
            res.status(404).json({ success: false, message: 'MCQ not found.' });
            return;
        }
        res.status(200).json({ success: true, data: mcq });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMcq = updateMcq;
const deleteMcq = async (req, res, next) => {
    try {
        const mcq = await mcq_model_1.default.findByIdAndDelete(req.params.id);
        if (!mcq) {
            res.status(404).json({ success: false, message: 'MCQ not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'MCQ deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMcq = deleteMcq;
const bulkCreateMcqs = async (req, res, next) => {
    try {
        const { topic, mcqs } = req.body;
        const docs = mcqs.map((m) => ({ ...m, topic }));
        const created = await mcq_model_1.default.insertMany(docs);
        res.status(201).json({ success: true, data: created, count: created.length });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkCreateMcqs = bulkCreateMcqs;
