import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "./api";

export interface IMessage {
  _id?: string;
  chatId: string;
  text: string;
  sender: "me" | "other";
  senderId: string;
}

export interface IChat {
  _id?: string;
  title: string;
  userId: string;
  messages?: IMessage[];
}

export function useChats() {
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get("/chats");
      setChats(response.data.chats);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  const createChat = async (title: string) => {
    if (!user) return;
    try {
      const response = await api.post("/chats", { title });
      setChats((prev) => [...prev, response.data.chat]);
      setMessages([]);
      return response.data.chat;
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const getMessages = async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const addMessage = async (chatId: string, text: string, sender: "me" | "other") => {
    if (!user) return;
    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        text,
        sender,
        senderId: user._id,
        chatId,
      });
      setMessages((prev) => [...prev, response.data.message]);
    } catch (error) {
      console.error("Failed to add message:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      setMessages([]);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleClearChatHistory = async () => {
    if (!user) return;
    try {
      await api.delete("/chats");
      setChats([]);
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  return {
    chats,
    messages,
    loading,
    createChat,
    getMessages,
    addMessage,
    setMessages,
    deleteChat: handleDeleteChat,
    clearChatHistory: handleClearChatHistory,
  };
}
