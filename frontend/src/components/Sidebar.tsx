"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatAPI } from "@/lib/api";
import { X, MessageSquare, FileUp, BookOpen, Globe2, FileSearch, PenTool } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface ChatListItem {
  id: string;
  title: string;
  lastMessage: null | { content: string };
}

const features = [
  { href: "/dashboard/documents", label: "Upload document", icon: FileUp },
  { href: "/dashboard/topics", label: "Explain a Topic", icon: BookOpen },
  { href: "/dashboard/wikipedia", label: "Research Wikipedia", icon: Globe2 },
  { href: "/dashboard/quizzes", label: "Take Quiz", icon: PenTool },
  { href: "/dashboard/websites", label: "Research Website", icon: FileSearch },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<ChatListItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await ChatAPI.list();
        setChats(data?.chats || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (open) load();
  }, [open]);

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-[88%] sm:w-96 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Menu</span>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">Features</h3>
            <div className="grid grid-cols-1 gap-2">
              {features.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded border text-sm transition-colors hover:bg-gray-50 ${
                    pathname === f.href ? "border-blue-200 bg-blue-50/60 text-blue-700" : "border-gray-200 text-gray-700"
                  }`}
                  onClick={onClose}
                >
                  <f.icon className="w-4 h-4" />
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">Previous Chats</h3>
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="text-sm text-gray-500">No chats yet.</div>
            ) : (
              <div className="space-y-2">
                {chats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/chat?open=${c.id}`}
                    className="block px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    {c.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">{c.lastMessage.content}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
