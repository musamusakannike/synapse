const express = require('express');
const {
    deleteChat,
    clearChatHistory,
    getChats,
    createChat,
    getMessages,
    createMessage,
} = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
    .get(getChats)
    .post(createChat)
    .delete(clearChatHistory);

router.route('/:chatId')
    .delete(deleteChat);

router.route('/:chatId/messages')
    .get(getMessages)
    .post(createMessage);

module.exports = router;
