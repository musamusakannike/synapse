"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FlashcardAPI, TopicAPI, DocumentAPI, WebsiteAPI } from "@/lib/api";
import { Plus, RefreshCw, Trash2, Play } from "lucide-react";
import Loader from "@/components/Loader";
import OptimisticLoader from "@/components/OptimisticLoader";
import HelpButton from "@/components/HelpButton";
import { helpConfigs } from "@/config/helpConfigs";

type FlashcardItem = {
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
};

type FlashcardSet = {
  id: string;
  title: string;
  description?: string;
  sourceType: "topic" | "document" | "website" | "manual";
  sourceId?: any;
  flashcardCount: number;
  studyStats: {
    totalStudySessions: number;
    averageScore: number;
    lastStudied?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type FlashcardSetFull = {
  _id: string;
  title: string;
  description?: string;
  sourceType: "topic" | "document" | "website" | "manual";
  flashcards: FlashcardItem[];
  studyStats: {
    totalStudySessions: number;
    averageScore: number;
    lastStudied?: string;
  };
};

type Topic = { _id: string; title: string };
type Doc = { _id: string; originalName: string };
type Site = { _id: string; url: string; title?: string };

export default function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<"topic" | "document" | "website" | "manual">("topic");
  const [sourceId, setSourceId] = useState<string>("");
  const [numberOfCards, setNumberOfCards] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [includeDefinitions, setIncludeDefinitions] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(false);
  const [focusAreas, setFocusAreas] = useState("");

  // Source data
  const [topics, setTopics] = useState<Topic[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  // Study happens on a separate page now

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: f }, { data: t }, { data: d }, { data: w }] = await Promise.all([
        FlashcardAPI.list(),
        TopicAPI.list(),
        DocumentAPI.list(),
        WebsiteAPI.list(),
      ]);
      setFlashcardSets(f?.flashcardSets || []);
      setTopics((t || []).map((x: any) => ({ _id: x._id, title: x.title })));
      setDocs((d || []).map((x: any) => ({ _id: x._id, originalName: x.originalName })));
      setSites((w || []).map((x: any) => ({ _id: x._id, url: x.url, title: x.title })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setGenerating(true);
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        sourceType,
        settings: {
          numberOfCards,
          difficulty,
          includeDefinitions,
          includeExamples,
          focusAreas: focusAreas.trim() ? focusAreas.split(",").map(s => s.trim()) : [],
        },
      };
      if (sourceId) payload.sourceId = sourceId;
      
      await FlashcardAPI.generate(payload);
      setTitle("");
      setDescription("");
      setSourceId("");
      setNumberOfCards(10);
      setDifficulty("medium");
      setIncludeDefinitions(true);
      setIncludeExamples(false);
      setFocusAreas("");
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  // Inline study logic removed

  const remove = async (id: string) => {
    if (!confirm("Delete this flashcard set?")) return;
    try {
      await FlashcardAPI.delete(id);
      setFlashcardSets(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const sourceOptions = useMemo(() => {
    if (sourceType === "topic") return topics.map(t => ({ value: t._id, label: t.title }));
    if (sourceType === "document") return docs.map(d => ({ value: d._id, label: d.originalName }));
    return sites.map(s => ({ value: s._id, label: s.title || s.url }));
  }, [sourceType, topics, docs, sites]);

  // No currentCard on this page

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-600">Generate and study flashcards to improve retention</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <Plus className="w-4 h-4" /> Generate
          </button>
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Generate Form (Modal) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGenerateModal(false)} />
          <div className="absolute inset-x-0 top-10 mx-auto max-w-3xl w-[92%] bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Generate Flashcards</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-sm text-gray-600 hover:text-gray-900">Close</button>
            </div>
            <div className="p-5">
              <form data-help="create-flashcards" onSubmit={generate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Flashcard set title (required)"
                    className="w-full border border-gray-200 rounded px-3 py-2"
                  />
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full border border-gray-200 rounded px-3 py-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={numberOfCards}
                      onChange={(e) => setNumberOfCards(parseInt(e.target.value || "10"))}
                      className="border border-gray-200 rounded px-3 py-2"
                      placeholder="# Cards"
                    />
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="border border-gray-200 rounded px-3 py-2"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value as any)}
                      className="border border-gray-200 rounded px-3 py-2"
                    >
                      <option value="topic">Topic</option>
                      <option value="document">Document</option>
                      <option value="website">Website</option>
                      <option value="manual">Manual</option>
                    </select>
                    {sourceType !== "manual" && (
                      <select
                        value={sourceId}
                        onChange={(e) => setSourceId(e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-3 py-2 max-w-[80vw]"
                      >
                        <option value="">Select source (optional)</option>
                        {sourceOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    placeholder="Focus areas (comma-separated)"
                    className="w-full border border-gray-200 rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={includeDefinitions}
                      onChange={(e) => setIncludeDefinitions(e.target.checked)}
                    />
                    Include definitions
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={includeExamples}
                      onChange={(e) => setIncludeExamples(e.target.checked)}
                    />
                    Include examples
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowGenerateModal(false)} className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button
                    disabled={!title.trim() || generating}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {generating ? <Loader size="xs" /> : <Plus className="w-4 h-4" />}
                    Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Sets List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your flashcard sets</h2>
          <button
            onClick={load}
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <OptimisticLoader
            messages={[
              "Loading your flashcard sets...",
              "Fetching study materials...",
              "Preparing your learning tools...",
            ]}
            interval={2500}
          />
        ) : flashcardSets.length === 0 ? (
          <p className="text-gray-600">No flashcard sets yet. Generate one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map((set) => (
              <div
                key={set.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{set.title}</p>
                    {set.description && (
                      <p className="text-sm text-gray-600 truncate">{set.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {set.flashcardCount} cards • {set.sourceType}
                    </p>
                    {set.studyStats.totalStudySessions > 0 && (
                      <p className="text-xs text-gray-500">
                        Avg: {Math.round(set.studyStats.averageScore)}% • {set.studyStats.totalStudySessions} sessions
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(set.id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Delete flashcard set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/dashboard/flashcards/${set.id}`}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    <Play className="w-4 h-4" /> Study
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion popup removed; handled in study page */}

      <HelpButton helpConfig={helpConfigs.flashcards} />
    </div>
  );
}
