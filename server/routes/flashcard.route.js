const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  getUserFlashcardSets,
  getFlashcardSet,
  generateFlashcards,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateStudyStats,
} = require("../controllers/flashcard.controller");
const { body } = require("express-validator");

const router = express.Router();

const generateFlashcardsValidation = [
  body("sourceType")
    .isIn(["topic", "document", "website", "course", "manual"])
    .withMessage("Invalid source type"),
  body("settings.numberOfCards")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Number of cards must be between 1 and 50"),
  body("settings.difficulty")
    .optional()
    .isIn(["easy", "medium", "hard", "mixed"])
    .withMessage("Invalid difficulty level"),
];

const updateFlashcardSetValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .trim(),
];

const updateStudyStatsValidation = [
  body("score")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
  body("sessionDuration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Session duration must be a positive number"),
];

// Routes
router.get("/", authenticate, getUserFlashcardSets);
router.get("/:id", authenticate, getFlashcardSet);
router.post("/generate", authenticate, generateFlashcardsValidation, generateFlashcards);
router.put("/:id", authenticate, updateFlashcardSetValidation, updateFlashcardSet);
router.delete("/:id", authenticate, deleteFlashcardSet);
router.post("/:id/study-stats", authenticate, updateStudyStatsValidation, updateStudyStats);

module.exports = router;
