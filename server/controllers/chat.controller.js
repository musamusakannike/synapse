import asyncHandler from "express-async-handler";
import Chat from "../models/chats.model.js";
import Message from "../models/messages.model.js";

// Delete Chat
export const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    await Message.deleteMany({ chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat deleted successfully" });
});

// Clear Chat History
export const clearChatHistory = asyncHandler(async (req, res) => {
    const userId = res.locals.user._id;

    const chats = await Chat.find({ userId });

    for (const chat of chats) {
        await Message.deleteMany({ chatId: chat._id });
    }

    await Chat.deleteMany({ userId });

    res.status(200).json({ message: "Chat history cleared successfully" });
});

// Get Chats
export const getChats = asyncHandler(async (req, res) => {
    const userId = res.locals.user._id;
    const chats = await Chat.find({ userId });
    res.status(200).json({ chats });
});

// Create Chat
export const createChat = asyncHandler(async (req, res) => {
    const { title } = req.body;
    const userId = res.locals.user._id;

    if (!title) {
        res.status(400);
        throw new Error("Title is required");
    }

    const chat = await Chat.create({
        title,
        userId,
    });

    res.status(201).json({ chat });
});

// Get Messages
export const getMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId });
    res.status(200).json({ messages });
});

// Create Message
export const createMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { text, sender } = req.body;
    const senderId = res.locals.user._id;

    if (!text || !sender) {
        res.status(400);
        throw new Error("Text and sender are required");
    }

    const message = await Message.create({
        chatId,
        text,
        sender,
        senderId,
    });

    res.status(201).json({ message });
});
