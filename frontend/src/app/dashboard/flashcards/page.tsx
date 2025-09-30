"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FlashcardAPI, TopicAPI, DocumentAPI, WebsiteAPI } from "@/lib/api";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BarChart3,
  Settings,
} from "lucide-react";
import Loader from "@/components/Loader";

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

  // Study mode states
  const [studyingId, setStudyingId] = useState<string | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSetFull | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studyResults, setStudyResults] = useState<{ correct: number; total: number } | null>(null);
  const [cardResults, setCardResults] = useState<boolean[]>([]);

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

  const startStudy = async (id: string) => {
    try {
      const { data } = await FlashcardAPI.get(id);
      const set = data?.flashcardSet;
      if (set) {
        setCurrentSet(set);
        setStudyingId(id);
        setCurrentCardIndex(0);
        setShowBack(false);
        setStudyResults(null);
        setCardResults([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markCard = (correct: boolean) => {
    if (!currentSet) return;
    const newResults = [...cardResults];
    newResults[currentCardIndex] = correct;
    setCardResults(newResults);
    
    if (currentCardIndex < currentSet.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowBack(false);
    } else {
      // Study session complete
      const correctCount = newResults.filter(r => r).length;
      const score = Math.round((correctCount / newResults.length) * 100);
      setStudyResults({ correct: correctCount, total: newResults.length });
      
      // Update study stats
      FlashcardAPI.updateStudyStats(studyingId!, score).catch(console.error);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this flashcard set?")) return;
    try {
      await FlashcardAPI.delete(id);
      setFlashcardSets(prev => prev.filter(f => f.id !== id));
      if (studyingId === id) {
        setStudyingId(null);
        setCurrentSet(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sourceOptions = useMemo(() => {
    if (sourceType === "topic") return topics.map(t => ({ value: t._id, label: t.title }));
    if (sourceType === "document") return docs.map(d => ({ value: d._id, label: d.originalName }));
    return sites.map(s => ({ value: s._id, label: s.title || s.url }));
  }, [sourceType, topics, docs, sites]);

  const currentCard = currentSet?.flashcards[currentCardIndex];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
        <p className="text-gray-600">Generate and study flashcards to improve retention</p>
      </div>

      {/* Generate Form */}
      <form onSubmit={generate} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
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
                className="flex-1 border border-gray-200 rounded px-3 py-2"
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

        <button
          disabled={!title.trim() || generating}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {generating ? <Loader /> : <Plus className="w-4 h-4" />}
          Generate Flashcards
        </button>
      </form>

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
          <div className="flex items-center justify-center h-32">
            <Loader size="30" />
          </div>
        ) : flashcardSets.length === 0 ? (
          <p className="text-gray-600">No flashcard sets yet. Generate one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map((set) => (
              <div
                key={set.id}
                className={`border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white ${
                  studyingId === set.id ? "ring-2 ring-purple-200" : ""
                }`}
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
                  <button
                    onClick={() => startStudy(set.id)}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    <Play className="w-4 h-4" /> Study
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Mode */}
      {currentSet && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-purple-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentSet.title}</h3>
                <p className="text-sm text-gray-600">
                  Card {currentCardIndex + 1} of {currentSet.flashcards.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStudyingId(null);
                setCurrentSet(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {studyResults ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Study Complete!</h4>
              <p className="text-gray-600 mb-4">
                You got {studyResults.correct} out of {studyResults.total} cards correct
              </p>
              <p className="text-2xl font-bold text-green-600 mb-6">
                {Math.round((studyResults.correct / studyResults.total) * 100)}%
              </p>
              <button
                onClick={() => {
                  setCurrentCardIndex(0);
                  setShowBack(false);
                  setStudyResults(null);
                  setCardResults([]);
                }}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                <RotateCcw className="w-4 h-4" />
                Study Again
              </button>
            </div>
          ) : currentCard ? (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / currentSet.flashcards.length) * 100}%` }}
                />
              </div>

              {/* Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 min-h-[200px] flex flex-col justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 mb-4">{currentCard.front}</p>
                  {showBack && (
                    <div className="border-t border-gray-300 pt-4">
                      <p className="text-gray-700">{currentCard.back}</p>
                      {currentCard.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 justify-center">
                          {currentCard.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!showBack ? (
                  <button
                    onClick={() => setShowBack(true)}
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded"
                  >
                    <Eye className="w-4 h-4" />
                    Show Answer
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => markCard(false)}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded"
                    >
                      Incorrect
                    </button>
                    <button
                      onClick={() => markCard(true)}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded"
                    >
                      Correct
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (currentCardIndex > 0) {
                      setCurrentCardIndex(currentCardIndex - 1);
                      setShowBack(false);
                    }
                  }}
                  disabled={currentCardIndex === 0}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {currentCardIndex + 1} / {currentSet.flashcards.length}
                </span>
                <button
                  onClick={() => {
                    if (currentCardIndex < currentSet.flashcards.length - 1) {
                      setCurrentCardIndex(currentCardIndex + 1);
                      setShowBack(false);
                    }
                  }}
                  disabled={currentCardIndex === currentSet.flashcards.length - 1}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
