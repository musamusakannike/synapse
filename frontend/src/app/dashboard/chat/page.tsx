"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Plus,
  Trash2,
  Edit3,
  Brain,
  User,
  Loader,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import api, {ChatAPI} from "@/lib/api";

interface Message {
  _id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const response = await api.get("/chats");
      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await api.post("/chats/new", { title: "New Chat" });
      const newChat = response.data.chat;
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Add user message to UI immediately
    const userMessage: Message = {
      _id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.post(`/chats/${selectedChat._id}/message`, {
        content: messageContent,
      });

      // Replace the temporary message with the actual response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove temporary message
        response.data.userMessage,
        response.data.aiMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the temporary message on error
      setMessages((prev) => prev.slice(0, -1));
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await api.delete(`/chats/${chatId}`);
      setChats(chats.filter((chat) => chat._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      await api.put(`/chats/${chatId}/title`, { title });
      setChats(
        chats.map((chat) => (chat._id === chatId ? { ...chat, title } : chat))
      );
      if (selectedChat?._id === chatId) {
        setSelectedChat({ ...selectedChat, title });
      }
      setEditingTitle(null);
    } catch (error) {
      console.error("Failed to update chat title:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden w-full py-2 lg:py-4">
      <Sidebar />

      <div className="flex-1 flex bg-white border border-gray-200 lg:rounded-lg overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Chats</h2>
              <button
                onClick={createNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No chats yet</p>
                <button
                  onClick={createNewChat}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                >
                  Start your first chat
                </button>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?._id === chat._id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedChat(chat);
                      fetchChatMessages(chat._id);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      {editingTitle === chat._id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => {
                            updateChatTitle(chat._id, newTitle);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              updateChatTitle(chat._id, newTitle);
                            }
                          }}
                          className="w-full text-sm font-medium bg-transparent border-none focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </h3>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitle(chat._id);
                          setNewTitle(chat.title);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat._id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedChat.title}
                </h3>
                <p className="text-sm text-gray-600">
                  AI-powered study assistant
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-gray-600">
                        Ask me anything about your study materials or any topic
                        you'd like to learn about.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-start space-x-3 ${
                        message.sender === "user" ? "justify-end" : ""
                      }`}
                    >
                      {message.sender === "ai" && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="w-4 h-4 text-blue-600" />
                        </div>
                      )}

                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {sending && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      rows={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={sending}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={`p-3 rounded-lg transition-colors ${
                      newMessage.trim() && !sending
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a chat to start
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose an existing conversation or create a new one
                </p>
                <button
                  onClick={createNewChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
