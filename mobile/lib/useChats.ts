import { useState, useEffect } from "react";
import { databases, deleteChat, clearChatHistory } from "./appwrite";
import { ID, Query } from "appwrite";
import { useAuth } from "@/context/AuthContext";

export interface IMessage {
  $id?: string;
  chatId: string;
  text: string;
  sender: "me" | "other";
}

export interface IChat {
  $id?: string;
  title: string;
  userId: string;
  messages?: IMessage[];
}

const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const APPWRITE_CHATS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!;
const APPWRITE_MESSAGES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!;

const DATABASE_ID = APPWRITE_DATABASE_ID;
const CHATS_COLLECTION_ID = APPWRITE_CHATS_COLLECTION_ID;
const MESSAGES_COLLECTION_ID = APPWRITE_MESSAGES_COLLECTION_ID;

export function useChats() {
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHATS_COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      setChats(response.documents as any);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (title: string) => {
    if (!user) return;
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        CHATS_COLLECTION_ID,
        ID.unique(),
        {
          title,
          userId: user.$id,
        }
      );
      setChats((prev) => [...prev, response as any]);
      setMessages([]);
      return response as any;
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const getMessages = async (chatId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.equal("chatId", chatId)]
      );
      setMessages(response.documents as any);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const addMessage = async (message: IMessage) => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        message
      );
      setMessages((prev) => [...prev, response as any]);
    } catch (error) {
      console.error("Failed to add message:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.$id !== chatId));
      setMessages([]);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleClearChatHistory = async () => {
    if (!user) return;
    try {
      await clearChatHistory(user.$id);
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
