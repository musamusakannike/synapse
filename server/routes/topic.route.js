const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  regenerateTopicContent,
} = require("../controllers/topic.controller");

const router = express.Router();

// Routes
router.post("/", authenticate, createTopic);
router.get("/", authenticate, listTopics);
router.get("/:id", authenticate, getTopic);
router.put("/:id", authenticate, updateTopic);
router.delete("/:id", authenticate, deleteTopic);
router.post("/:id/generate", authenticate, regenerateTopicContent);

module.exports = router;
