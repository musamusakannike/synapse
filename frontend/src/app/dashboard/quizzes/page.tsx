"use client";

import React, { useEffect, useMemo, useState } from "react";
import { QuizAPI, TopicAPI, DocumentAPI, WebsiteAPI } from "@/lib/api";
import {
  HelpCircle,
  Plus,
  RefreshCw,
  Trash2,
  Play,
  Save,
  ListChecks,
} from "lucide-react";
import Loader from "@/components/Loader";

type Quiz = {
  _id: string;
  title: string;
  description?: string;
  sourceType: "topic" | "document" | "website";
  sourceId?: string;
  sourceModel?: string;
  questions: {
    questionText: string;
    options: string[];
    correctOption: number;
    explanation: string;
    difficulty?: string;
    includesCalculation?: boolean;
  }[];
  settings?: {
    numberOfQuestions?: number;
    difficulty?: string;
    includeCalculations?: boolean;
    timeLimit?: number;
  };
  attempts?: any[];
};

type Topic = { _id: string; title: string };

type Doc = { _id: string; originalName: string };

type Site = { _id: string; url: string; title?: string };

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<
    "topic" | "document" | "website"
  >("topic");
  const [sourceId, setSourceId] = useState<string>("");
  const [content, setContent] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("mixed");
  const [includeCalculations, setIncludeCalculations] = useState(false);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [takingId, setTakingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null
  );

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: q }, { data: t }, { data: d }, { data: w }] =
        await Promise.all([
          QuizAPI.list(),
          TopicAPI.list(),
          DocumentAPI.list(),
          WebsiteAPI.list(),
        ]);
      setQuizzes(q || []);
      setTopics((t || []).map((x: any) => ({ _id: x._id, title: x.title })));
      setDocs(
        (d || []).map((x: any) => ({
          _id: x._id,
          originalName: x.originalName,
        }))
      );
      setSites(
        (w || []).map((x: any) => ({ _id: x._id, url: x.url, title: x.title }))
      );
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
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        sourceType,
        settings: {
          numberOfQuestions,
          difficulty,
          includeCalculations,
        },
      };
      if (content.trim()) payload.content = content.trim();
      if (sourceId) payload.sourceId = sourceId;
      await QuizAPI.create(payload);
      setTitle("");
      setDescription("");
      setContent("");
      setSourceId("");
      setNumberOfQuestions(10);
      setDifficulty("mixed");
      setIncludeCalculations(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const take = (id: string) => {
    const q = quizzes.find((x) => x._id === id) || null;
    setTakingId(id);
    setSelected({});
    setResult(null);
  };

  const submit = async () => {
    if (!takingId) return;
    try {
      setSubmitting(true);
      const q = quizzes.find((x) => x._id === takingId);
      const answers = (q?.questions || []).map((_, idx) => ({
        questionIndex: idx,
        selectedOption: typeof selected[idx] === "number" ? selected[idx] : -1,
      }));
      const { data } = await QuizAPI.submitAttempt(takingId, answers);
      const attempt = data?.attempt;
      if (attempt) {
        setResult({ score: attempt.score, total: attempt.totalQuestions });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await QuizAPI.delete(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      if (takingId === id) {
        setTakingId(null);
        setResult(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sourceOptions = useMemo(() => {
    if (sourceType === "topic")
      return topics.map((t) => ({ value: t._id, label: t.title }));
    if (sourceType === "document")
      return docs.map((d) => ({ value: d._id, label: d.originalName }));
    return sites.map((s) => ({ value: s._id, label: s.title || s.url }));
  }, [sourceType, topics, docs, sites]);

  const currentQuiz = quizzes.find((x) => x._id === takingId) || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-600">
          Generate and take quizzes to test your knowledge
        </p>
      </div>

      {/* Create */}
      <form
        onSubmit={create}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title (required)"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full border border-gray-200 rounded px-3 py-2"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min={1}
              value={numberOfQuestions}
              onChange={(e) =>
                setNumberOfQuestions(parseInt(e.target.value || "10"))
              }
              className="border border-gray-200 rounded px-3 py-2"
              placeholder="# Questions"
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
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeCalculations}
                onChange={(e) => setIncludeCalculations(e.target.checked)}
              />
              Calculations
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as any)}
              className="border border-gray-200 rounded px-3 py-2"
            >
              <option value="topic">Topic</option>
              <option value="document">Document</option>
              <option value="website">Website</option>
            </select>
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
          </div>
          <div className="md:col-span-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Optional custom content to generate from"
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          disabled={!title.trim() || creating}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? <Loader /> : <Plus className="w-4 h-4" />}
          Create Quiz
        </button>
      </form>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your quizzes</h2>
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
        ) : quizzes.length === 0 ? (
          <p className="text-gray-600">No quizzes yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((q) => (
              <div
                key={q._id}
                className={`border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white ${
                  takingId === q._id ? "ring-2 ring-orange-200" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {q.title}
                    </p>
                    {q.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {q.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {q.questions?.length || 0} questions • Difficulty:{" "}
                      {q.settings?.difficulty || "mixed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => remove(q._id)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => take(q._id)}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    <Play className="w-4 h-4" /> Take quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Take quiz panel */}
      {currentQuiz && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentQuiz.title}
              </h3>
              {result ? (
                <p className="text-sm text-gray-700">
                  Result: {result.score}/{result.total}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Answer the questions below and submit
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {currentQuiz.questions.map((qs, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <p className="font-medium text-gray-900">
                  Q{idx + 1}. {qs.questionText}
                </p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qs.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${
                        selected[idx] === oi
                          ? "border-orange-300 bg-orange-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={selected[idx] === oi}
                        onChange={() =>
                          setSelected((p) => ({ ...p, [idx]: oi }))
                        }
                      />
                      <span className="text-sm text-gray-800">{opt}</span>
                    </label>
                  ))}
                </div>
                {result && (
                  <p className="text-sm mt-2">
                    {typeof selected[idx] === "number" &&
                    selected[idx] ===
                      currentQuiz.questions[idx].correctOption ? (
                      <span className="text-green-700">Correct ✓</span>
                    ) : (
                      <span className="text-red-700">Incorrect ✗</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {submitting ? <Loader /> : <Save className="w-4 h-4" />}
              Submit answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
