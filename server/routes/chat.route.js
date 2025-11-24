const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  getUserChats,
  getChatWithMessages,
  sendMessage,
  createNewChat,
  updateChatTitle,
  deleteChat,
  bulkDeleteChats,
  archiveChat,
  unarchiveChat,
  getArchivedChats,
  favoriteChat,
  unfavoriteChat,
  getFavoriteChats,
  editMessage,
  regenerateResponse,
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

const bulkDeleteValidation = [
  body("chatIds")
    .isArray({ min: 1 })
    .withMessage("chatIds must be a non-empty array"),
];

const editMessageValidation = [
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message content is required"),
];

router.get("/", authenticate, getUserChats);
router.get("/archived", authenticate, getArchivedChats);
router.get("/favorites", authenticate, getFavoriteChats);
router.get("/:id", authenticate, getChatWithMessages);
router.post("/:id/message", authenticate, sendMessageValidation, sendMessage);
router.post("/new", authenticate, createNewChat);
router.post("/bulk-delete", authenticate, bulkDeleteValidation, bulkDeleteChats);
router.put("/:id/title", authenticate, updateChatTitleValidation, updateChatTitle);
router.put("/:id/archive", authenticate, archiveChat);
router.put("/:id/unarchive", authenticate, unarchiveChat);
router.put("/:id/favorite", authenticate, favoriteChat);
router.put("/:id/unfavorite", authenticate, unfavoriteChat);
router.put("/:id/message/:messageIndex", authenticate, editMessageValidation, editMessage);
router.post("/:id/message/:messageIndex/regenerate", authenticate, regenerateResponse);
router.delete("/:id", authenticate, deleteChat);


module.exports = router;
