const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createQuiz,
  listQuizzes,
  getQuiz,
  deleteQuiz,
  submitAttempt,
} = require("../controllers/quiz.controller");

const router = express.Router();

// Routes
router.post("/", authenticate, createQuiz);
router.get("/", authenticate, listQuizzes);
router.get("/:id", authenticate, getQuiz);
router.delete("/:id", authenticate, deleteQuiz);
router.post("/:id/attempt", authenticate, submitAttempt);

module.exports = router;