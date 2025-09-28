"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChatAPI } from "@/lib/api";
import {
  MessageCircle,
  Plus,
  Trash2,
  SendHorizontal,
  Loader2,
  Pencil,
} from "lucide-react";

// Server list returns shape: { chats, pagination }
interface ChatListItem {
  id: string;
  title: string;
  type: "topic" | "document" | "website" | "general";
  messageCount: number;
  lastMessage: null | { role: string; content: string; timestamp: string };
  lastActivity: string;
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatFull {
  _id: string;
  title: string;
  type: "topic" | "document" | "website" | "general";
  messages: Message[];
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatFull | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const loadChats = async () => {
    try {
      setLoadingList(true);
      const { data } = await ChatAPI.list();
      setChats(data?.chats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const openChat = async (id: string) => {
    try {
      setSelectedId(id);
      const { data } = await ChatAPI.get(id);
      const c = data?.chat;
      if (c) {
        setChat({
          _id: c._id,
          title: c.title,
          type: c.type,
          messages: c.messages || [],
        });
        setNewTitle(c.title);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const createChat = async () => {
    try {
      setCreating(true);
      const { data } = await ChatAPI.create();
      const id = data?.chat?.id;
      if (id) {
        await loadChats();
        await openChat(id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const removeChat = async (id: string) => {
    if (!confirm("Delete this chat?")) return;
    try {
      await ChatAPI.delete(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setChat(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const doSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !message.trim()) return;
    try {
      setSending(true);
      const { data } = await ChatAPI.sendMessage(selectedId, message.trim());
      const userMessage = data?.userMessage || { role: "user", content: message.trim() };
      const aiResponse = data?.aiResponse || { role: "assistant", content: "" };
      setChat((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, userMessage, aiResponse] }
          : prev
      );
      setMessage("");
      // refresh list for last activity
      loadChats();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const saveTitle = async () => {
    if (!selectedId || !newTitle.trim()) return;
    try {
      setRenaming(true);
      await ChatAPI.updateTitle(selectedId, newTitle.trim());
      setChat((prev) => (prev ? { ...prev, title: newTitle.trim() } : prev));
      setChats((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, title: newTitle.trim() } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setRenaming(false);
    }
  };

  const emptyState = useMemo(
    () => (
      <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg bg-white">
        <MessageCircle className="w-10 h-10 text-gray-400" />
        <p className="mt-2 text-gray-600">Start a new conversation to begin</p>
        <button
          onClick={createChat}
          disabled={creating}
          className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Chat
        </button>
      </div>
    ),
    [creating]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
          <p className="text-gray-600">Ask questions and get AI answers</p>
        </div>
        <button
          onClick={createChat}
          disabled={creating}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat list */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your chats</h2>
            <span className="text-sm text-gray-500">{chats.length}</span>
          </div>
          <div className="max-h-[520px] overflow-auto divide-y divide-gray-100">
            {loadingList ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : chats.length === 0 ? (
              <div className="p-6 text-gray-600">No chats yet.</div>
            ) : (
              chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openChat(c.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedId === c.id ? "bg-blue-50/60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{c.title}</p>
                      {c.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">{c.lastMessage.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{c.messageCount}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChat(c.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages panel */}
        <div className="lg:col-span-2">
          {!chat ? (
            emptyState
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-[640px]">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-3 py-2"
                />
                <button
                  onClick={saveTitle}
                  disabled={renaming}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  {renaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  Save
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {chat.messages.length === 0 ? (
                  <p className="text-gray-600">No messages yet. Ask a question below.</p>
                ) : (
                  chat.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[90%] md:max-w-[75%] p-3 rounded-lg border ${
                        m.role === "user"
                          ? "ml-auto bg-blue-50 border-blue-100"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{m.content}</p>
                      {m.timestamp && (
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(m.timestamp).toLocaleString()}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={doSend} className="p-3 border-t border-gray-200 flex items-center gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 border border-gray-200 rounded px-3 py-2"
                />
                <button
                  disabled={!message.trim() || sending}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
