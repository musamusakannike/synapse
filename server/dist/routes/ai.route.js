"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ai_validation_1 = require("../validations/ai.validation");
const router = (0, express_1.Router)();
// Protect all AI routes
router.use(auth_middleware_1.protect);
// Homepage AI Features
router.post('/summarize', ai_validation_1.validateSummarize, ai_controller_1.summarize);
router.post('/generate-quiz', ai_validation_1.validateGenerateQuiz, ai_controller_1.generateQuiz);
router.post('/generate-flashcards', ai_validation_1.validateGenerateFlashcards, ai_controller_1.generateFlashcards);
router.post('/qa', ai_validation_1.validateQA, ai_controller_1.qa);
// Course & Topic Quiz Features
router.post('/courses/:courseId/quiz', ai_validation_1.validateCourseQuiz, ai_controller_1.generateCourseQuiz);
router.post('/topics/:topicId/quiz', ai_validation_1.validateTopicQuiz, ai_controller_1.generateTopicQuiz);
// Generation History Features
router.get('/history', ai_controller_1.getHistory);
router.get('/history/:id', ai_controller_1.getHistoryById);
router.delete('/history/:id', ai_controller_1.deleteHistory);
exports.default = router;
