"use client";
import React, { useState } from "react";
import {
  Home,
  Plus,
  Book,
  Settings,
  FileText,
  MessageCircle,
  HelpCircle,
  Globe,
  Brain,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const Sidebar = () => {
  const router = useRouter();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      color: "text-gray-700 hover:text-blue-600",
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
      color: "text-gray-700 hover:text-blue-600",
    },
    {
      name: "Chat",
      href: "/dashboard/chat",
      icon: MessageCircle,
      color: "text-gray-700 hover:text-green-600",
    },
    {
      name: "Topics",
      href: "/dashboard/topics",
      icon: Book,
      color: "text-gray-700 hover:text-purple-600",
    },
    {
      name: "Quizzes",
      href: "/dashboard/quizzes",
      icon: HelpCircle,
      color: "text-gray-700 hover:text-orange-600",
    },
    {
      name: "Websites",
      href: "/dashboard/websites",
      icon: Globe,
      color: "text-gray-700 hover:text-indigo-600",
    },
  ];

  const createOptions = [
    { name: "Upload Document", href: "/dashboard/documents", icon: FileText },
    { name: "New Chat", href: "/dashboard/chat", icon: MessageCircle },
    { name: "Create Topic", href: "/dashboard/topics", icon: Book },
    { name: "New Quiz", href: "/dashboard/quizzes", icon: HelpCircle },
    { name: "Add Website", href: "/dashboard/websites", icon: Globe },
  ];

  return (
    <div className="w-80 transition-all duration-300 ease-in-out flex flex-col h-screen pt-2 lg:pt-4 px-4 bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h6 className="font-bold text-lg text-gray-800">SYNAPSE</h6>
        </div>
      </div>

      {/* Create Button */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out text-white rounded-lg px-4 py-3 flex items-center justify-center gap-x-2 font-semibold text-base shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Create
          <ChevronDown
            size={16}
            className={`transition-transform ${showCreateMenu ? "rotate-180" : ""}`}
          />
        </button>

        {/* Create Dropdown */}
        {showCreateMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {createOptions.map((option) => (
              <Link
                key={option.name}
                href={option.href}
                className="flex items-center gap-x-3 px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => setShowCreateMenu(false)}
              >
                <option.icon size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{option.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.color} hover:bg-white hover:shadow-sm group`}
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm group"
        >
          <Settings size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Settings</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
