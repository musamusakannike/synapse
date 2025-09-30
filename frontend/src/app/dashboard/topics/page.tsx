"use client";

import React, { useEffect, useState } from "react";
import { TopicAPI } from "@/lib/api";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  RotateCcw,
  Save,
} from "lucide-react";
import Loader from "@/components/Loader";
import HelpButton from "@/components/HelpButton";
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

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await TopicAPI.list();
      setTopics(data || []);
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
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
        <p className="text-gray-600">Generate and manage study topics</p>
      </div>

      {/* Create */}
      <form
        data-help="create-topic"
        onSubmit={create}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (required)"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Optional content (otherwise AI generates)"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
        </div>
        <button
          disabled={!title.trim() || creating}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? <Loader /> : <Plus className="w-4 h-4" />}
          Create Topic
        </button>
      </form>

      {/* List */}
      <div data-help="topic-list" className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your topics</h2>
          <button
            onClick={load}
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader size="30" />
          </div>
        ) : topics.length === 0 ? (
          <p className="text-gray-600">No topics yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-purple-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editId === t._id ? (
                      <div className="space-y-2">
                        <input
                          value={edit.title || ""}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, title: e.target.value }))
                          }
                          className="w-full border border-gray-200 rounded px-3 py-2"
                        />
                        <input
                          value={edit.description || ""}
                          onChange={(e) =>
                            setEdit((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded px-3 py-2"
                          placeholder="Description"
                        />
                        <textarea
                          value={edit.content || ""}
                          onChange={(e) =>
                            setEdit((p) => ({ ...p, content: e.target.value }))
                          }
                          className="w-full border border-gray-200 rounded px-3 py-2 min-h-[100px]"
                          placeholder="Content"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900 truncate">
                          {t.title}
                        </p>
                        {t.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {t.description}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-gray-800 line-clamp-5 whitespace-pre-wrap">
                          {t.content || t.generatedContent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {editId === t._id ? (
                    <button
                      onClick={saveEdit}
                      disabled={actionId === t._id}
                      className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      {actionId === t._id ? (
                        <Loader />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(t)}
                      className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => regenerate(t._id)}
                    disabled={actionId === t._id}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    {actionId === t._id ? (
                      <Loader />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Regenerate
                  </button>
                  <button
                    onClick={() => remove(t._id)}
                    disabled={actionId === t._id}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <HelpButton helpConfig={helpConfigs.topics} />
    </div>
  );
}
