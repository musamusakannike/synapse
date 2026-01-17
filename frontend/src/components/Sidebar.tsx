"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatAPI } from "@/lib/api";
import { useChat } from "@/contexts/ChatContext";
import { X, MessageSquare, Search, Star, Archive, PenSquare, Trash2, Edit2, BookOpen, HelpCircle, Layers, Crown } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface ChatListItem {
  id: string;
  title: string;
  lastMessage: null | { content: string; timestamp: string };
  isArchived?: boolean;
  isFavorite?: boolean;
}

type TabType = "all" | "favorites" | "archived";

const QUICK_LINKS = [
  { label: "Courses", href: "/dashboard/courses", icon: BookOpen, color: "text-green-400 bg-green-400/15" },
  { label: "Quizzes", href: "/dashboard/quizzes", icon: HelpCircle, color: "text-purple-400 bg-purple-400/15" },
  { label: "Flashcards", href: "/dashboard/flashcards", icon: Layers, color: "text-blue-400 bg-blue-400/15" },
  { label: "Subscription", href: "/dashboard/subscription", icon: Crown, color: "text-yellow-400 bg-yellow-400/15" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const { openChat, createNewChat } = useChat();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchChats();
    }
  }, [open, activeTab]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "favorites") {
        response = await ChatAPI.getFavoriteChats(1, 50);
      } else if (activeTab === "archived") {
        response = await ChatAPI.getArchivedChats(1, 50);
      } else {
        response = await ChatAPI.getUserChats(1, 50);
      }
      const chatData = response.data.chats.map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        lastMessage: chat.lastMessage,
        isArchived: chat.isArchived || false,
        isFavorite: chat.isFavorite || false,
      }));
      setChats(chatData);
      setFilteredChats(chatData);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  };

  const handleChatClick = async (chatId: string) => {
    if (selectionMode) {
      toggleSelection(chatId);
    } else {
      await openChat(chatId);
      onClose();
    }
  };

  const handleNewChat = () => {
    createNewChat();
    onClose();
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await ChatAPI.delete(chatId);
      fetchChats();
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleArchiveChat = async (chatId: string, isArchived: boolean) => {
    try {
      if (isArchived) {
        await ChatAPI.unarchiveChat(chatId);
      } else {
        await ChatAPI.archiveChat(chatId);
      }
      fetchChats();
    } catch (err) {
      console.error("Error archiving chat:", err);
    }
  };

  const handleFavoriteChat = async (chatId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await ChatAPI.unfavoriteChat(chatId);
      } else {
        await ChatAPI.favoriteChat(chatId);
      }
      fetchChats();
    } catch (err) {
      console.error("Error favoriting chat:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChats.size === 0) return;
    try {
      await ChatAPI.bulkDeleteChats(Array.from(selectedChats));
      setSelectedChats(new Set());
      setSelectionMode(false);
      fetchChats();
    } catch (err) {
      console.error("Error bulk deleting chats:", err);
    }
  };

  const toggleSelection = (chatId: string) => {
    setSelectedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      if (newSet.size === 0) {
        setSelectionMode(false);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleQuickLinkClick = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-100 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl transform transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">Chats</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close sidebar">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Quick Links */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => handleQuickLinkClick(link.href)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-5">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            All Chats
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1 ${activeTab === "favorites"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Star className="w-4 h-4" />
            Favorites
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1 ${activeTab === "archived"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Archive className="w-4 h-4" />
            Archived
          </button>
        </div>

        {/* Search and New Chat */}
        <div className="px-5 py-4 space-y-3">
          {!selectionMode ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm
                           text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700
                         text-white rounded-full transition-colors"
              >
                <PenSquare className="w-4 h-4" />
                New Chat
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedChats(new Set());
                }}
                className="text-blue-600 font-medium"
              >
                Cancel
              </button>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedChats.size} selected
              </span>
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                {searchQuery ? "No chats found" : activeTab === "favorites" ? "No favorite chats" : activeTab === "archived" ? "No archived chats" : "No chats yet"}
              </p>
              {!searchQuery && activeTab === "all" && (
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Create a new chat to get started
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1 px-3">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!selectionMode) {
                      setSelectionMode(true);
                      setSelectedChats(new Set([chat.id]));
                    }
                  }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${selectedChats.has(chat.id)
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {selectionMode && (
                      <div className="shrink-0 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedChats.has(chat.id)
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 dark:border-gray-600"
                            }`}
                        >
                          {selectedChats.has(chat.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {chat.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {chat.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          {chat.isArchived && <Archive className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                      {chat.lastMessage && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {chat.lastMessage.content}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                            {formatTimestamp(chat.lastMessage.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!selectionMode && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteChat(chat.id, chat.isFavorite || false);
                        }}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={chat.isFavorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star className={`w-4 h-4 ${chat.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveChat(chat.id, chat.isArchived || false);
                        }}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={chat.isArchived ? "Unarchive" : "Archive"}
                      >
                        <Archive className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Delete Button */}
        {selectionMode && selectedChats.size > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleBulkDelete}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700
                       text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedChats.size} chat{selectedChats.size > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
