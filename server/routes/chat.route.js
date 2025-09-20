import express from 'express';
import {
    deleteChat,
    clearChatHistory,
    getChats,
    createChat,
    getMessages,
    createMessage,
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

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

export default router;
