const express = require("express");
const rateLimit = require("express-rate-limit");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createQuiz,
  listQuizzes,
  getQuiz,
  deleteQuiz,
  submitAttempt,
} = require("../controllers/quiz.controller");

const router = express.Router();

// Lenient rate limiter for quiz polling (GET requests)
// Allows 200 requests per 15 minutes (about 13 requests/minute)
const quizGetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: "Too many quiz requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post("/", authenticate, createQuiz);
router.get("/", authenticate, quizGetLimiter, listQuizzes);
router.get("/:id", authenticate, quizGetLimiter, getQuiz);
router.delete("/:id", authenticate, deleteQuiz);
router.post("/:id/attempt", authenticate, submitAttempt);

module.exports = router;