const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  getUserChats,
  getChatWithMessages,
  sendMessage,
  createNewChat,
  updateChatTitle,
  deleteChat,
} = require("../controllers/chat.controller");
const { body } = require("express-validator");
const router = express.Router();

const sendMessageValidation = [
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message content is required"),
];

const updateChatTitleValidation = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Chat title is required"),
];

router.get("/", authenticate, getUserChats);
router.get("/:id", authenticate, getChatWithMessages);
router.post("/:id/message", authenticate, sendMessageValidation, sendMessage);
router.post("/new", authenticate, createNewChat);
router.put("/:id/title", authenticate, updateChatTitleValidation, updateChatTitle);
router.delete("/:id", authenticate, deleteChat);


module.exports = router;
