"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TopicAPI } from "@/lib/api";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  RotateCcw,
  Save,
  Menu,
  X,
} from "lucide-react";
import Loader from "@/components/Loader";
import HelpButton from "@/components/HelpButton";
import TTSButton from "@/components/TTSButton";
import { helpConfigs } from "@/config/helpConfigs";

type Topic = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  generatedContent?: string;
  customizations?: Record<string, any>;
  createdAt?: string;
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Topic>>({});
  const [actionId, setActionId] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Topic | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await TopicAPI.list();
      setTopics(data || []);
      // Keep selection in sync
      if (selected) {
        const fresh = (data || []).find((t: Topic) => t._id === selected._id) || null;
        setSelected(fresh);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setCreating(true);
      await TopicAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setContent("");
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (t: Topic) => {
    setEditId(t._id);
    setEdit({ title: t.title, description: t.description, content: t.content });
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      setActionId(editId);
      await TopicAPI.update(editId, {
        title: edit.title,
        description: edit.description,
        content: edit.content,
      });
      setEditId(null);
      setEdit({});
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const regenerate = async (id: string) => {
    try {
      setActionId(id);
      await TopicAPI.regenerate(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this topic?")) return;
    try {
      setActionId(id);
      await TopicAPI.delete(id);
      setTopics((prev) => prev.filter((t) => t._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };
  // Filter
  const filtered = topics.filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden lg:block w-72 border-r border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Topics</h2>
          <button onClick={load} className="p-2 rounded hover:bg-gray-100" aria-label="Refresh topics">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        />
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-500">No topics found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t._id}
                onClick={() => {
                  setSelected(t);
                  setSidebarOpen(false);
                }}
                className={`p-2 rounded cursor-pointer border ${selected?._id === t._id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"}`}
              >
                <p className="font-medium truncate" title={t.title}>{t.title}</p>
                {t.description && (
                  <p className="text-xs text-gray-500 truncate" title={t.description}>{t.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[80%] bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Topics</h2>
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <button onClick={load} className="p-2 rounded border hover:bg-gray-50" aria-label="Refresh topics">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <Loader />
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-500">No topics found.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSelected(t);
                      setSidebarOpen(false);
                    }}
                    className={`p-2 rounded cursor-pointer border ${selected?._id === t._id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"}`}
                  >
                    <p className="font-medium truncate" title={t.title}>{t.title}</p>
                    {t.description && (
                      <p className="text-xs text-gray-500 truncate" title={t.description}>{t.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between lg:hidden p-3 border-b border-gray-200">
          <button className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="w-5 h-5" />
            <span className="text-sm">Topics</span>
          </button>
          {selected && <span className="text-sm text-gray-600 truncate max-w-[60%]" title={selected.title}>{selected.title}</span>}
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 overflow-y-auto pb-32">
          {!selected ? (
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
              <p className="text-gray-600">Generate and manage study topics</p>
              {!loading && topics.length === 0 && (
                <div className="mt-6 text-gray-600">No topics yet. Use the composer below to create one.</div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {editId === selected._id ? (
                    <div className="space-y-2">
                      <input
                        value={edit.title || ""}
                        onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2"
                      />
                      <input
                        value={edit.description || ""}
                        onChange={(e) => setEdit((p) => ({ ...p, description: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2"
                        placeholder="Description"
                      />
                      <textarea
                        value={edit.content || ""}
                        onChange={(e) => setEdit((p) => ({ ...p, content: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 min-h-[120px]"
                        placeholder="Content"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 truncate" title={selected.title}>{selected.title}</h1>
                      {selected.description && (
                        <p className="text-sm text-gray-600 mt-1">{selected.description}</p>
                      )}
                      <div className="mt-4 prose prose-sm sm:prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selected.content || selected.generatedContent || ""}
                        </ReactMarkdown>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <TTSButton text={selected.content || selected.generatedContent || ""} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {editId === selected._id ? (
                  <button
                    onClick={saveEdit}
                    disabled={actionId === selected._id}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    {actionId === selected._id ? <Loader /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(selected)}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => regenerate(selected._id)}
                  disabled={actionId === selected._id}
                  className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                >
                  {actionId === selected._id ? <Loader /> : <RotateCcw className="w-4 h-4" />}
                  Regenerate
                </button>
                <button
                  onClick={() => remove(selected._id)}
                  disabled={actionId === selected._id}
                  className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom composer to create topics */}
        <div className="fixed left-0 right-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-4xl mx-auto px-3 py-3">
            <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New topic title (required)"
                className="w-full border border-gray-200 rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="flex-1 border border-gray-200 rounded px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={!title.trim() || creating}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {creating ? <Loader /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Optional content (leave empty to auto-generate)"
                className="hidden sm:block sm:col-span-2 w-full border border-gray-200 rounded px-3 py-2 min-h-[48px] max-h-40"
                rows={2}
              />
            </form>
          </div>
        </div>
      </div>

      <HelpButton helpConfig={helpConfigs.topics} />
    </div>
  );
}
