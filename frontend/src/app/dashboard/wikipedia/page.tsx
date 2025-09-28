"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WikipediaAPI, ChatAPI, QuizAPI } from "@/lib/api";
import { Loader2, Search, BookOpen, ExternalLink, MessageCircle, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface WikiSearchItem {
  id?: number;
  key?: string;
  title: string;
  excerpt?: string;
  description?: string;
  thumbnail?: { url?: string } | null;
}

interface WikiPageDetail {
  lang: string;
  title: string;
  description?: string;
  extract?: string;
  extract_html?: string;
  thumbnail?: { source?: string; url?: string } | null;
  originalimage?: { source?: string } | null;
  url: string;
  contentHtml: string;
  pageid?: number;
}

export default function WikipediaPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WikiSearchItem[]>([]);

  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [detail, setDetail] = useState<WikiPageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [importing, setImporting] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const doSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const { data } = await WikipediaAPI.search(query.trim(), lang, 20);
      setResults(data?.results || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (title: string) => {
    try {
      setLoadingDetail(true);
      setSelectedTitle(title);
      const { data } = await WikipediaAPI.page(title, lang);
      setDetail(data as WikiPageDetail);
    } catch (err) {
      console.error(err);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const importPage = async (): Promise<{ _id: string } | null> => {
    if (!detail?.title) return null;
    try {
      setImporting(true);
      const { data } = await WikipediaAPI.import(detail.title, lang);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setImporting(false);
    }
  };

  const importAndChat = async () => {
    const site = await importPage();
    if (!site?._id) return;
    try {
      setCreatingChat(true);
      const { data } = await ChatAPI.create({ type: "website", sourceId: site._id, title: `${detail?.title} - Chat` });
      const chatId = data?.chat?.id;
      if (chatId) {
        router.push(`/dashboard/chat?open=${chatId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingChat(false);
    }
  };

  const importAndCreateQuiz = async () => {
    const site = await importPage();
    if (!site?._id) return;
    try {
      setCreatingQuiz(true);
      await QuizAPI.create({
        title: `${detail?.title} Quiz`,
        description: detail?.description || undefined,
        sourceType: "website",
        sourceId: site._id,
        settings: { numberOfQuestions: 10, difficulty: "mixed", includeCalculations: false },
      });
      router.push("/dashboard/quizzes");
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingQuiz(false);
    }
  };

  const heroImage = useMemo(() => {
    return (
      detail?.originalimage?.source ||
      (detail?.thumbnail as any)?.source ||
      (detail?.thumbnail as any)?.url ||
      undefined
    );
  }, [detail]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wikipedia</h1>
        <p className="text-gray-600">Search Wikipedia and act on the results with AI</p>
      </div>

      {/* Search */}
      <form onSubmit={doSearch} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-5 flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Search className="w-6 h-6 text-indigo-600" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Wikipedia (e.g., Quantum mechanics)"
              className="flex-1 border border-gray-200 rounded px-3 py-2"
            />
          </div>
          <div className="md:col-span-1 flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
        <button
          disabled={!query.trim() || loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {/* Results + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results list */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Results</h2>
            <span className="text-sm text-gray-500">{results.length}</span>
          </div>
          <div className="max-h-[520px] overflow-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-gray-600">No results yet. Try a search above.</div>
            ) : (
              results.map((r, idx) => (
                <button
                  key={(r.key || r.title || idx.toString()) + idx}
                  onClick={() => loadDetail(r.title)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedTitle === r.title ? "bg-indigo-50/60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {r.thumbnail?.url ? (
                      <img src={r.thumbnail.url} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{r.title}</p>
                      {r.description && <p className="text-xs text-gray-500 truncate">{r.description}</p>}
                      {r.excerpt && (
                        <p className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!detail ? (
            <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg bg-white">
              <BookOpen className="w-10 h-10 text-gray-400" />
              <p className="mt-2 text-gray-600">Select an article to preview</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {heroImage && (
                <div className="w-full h-56 bg-gray-100 overflow-hidden">
                  <img src={heroImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{detail.title}</h3>
                    {detail.description && <p className="text-sm text-gray-600">{detail.description}</p>}
                  </div>
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> View on Wikipedia
                  </a>
                </div>

                {loadingDetail ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <>
                    {detail.extract && (
                      <p className="text-gray-800 mt-3 whitespace-pre-wrap">{detail.extract}</p>
                    )}
                    {detail.contentHtml && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Article</h4>
                        <div
                          className="max-h-[480px] overflow-auto text-sm text-gray-800"
                          dangerouslySetInnerHTML={{ __html: detail.contentHtml }}
                        />
                      </div>
                    )}
                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <button
                        onClick={importPage}
                        disabled={importing}
                        className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                      >
                        {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        Import to My Websites
                      </button>
                      <button
                        onClick={importAndChat}
                        disabled={importing || creatingChat}
                        className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                      >
                        {creatingChat ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4" />
                        )}
                        Import & Start Chat
                      </button>
                      <button
                        onClick={importAndCreateQuiz}
                        disabled={importing || creatingQuiz}
                        className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                      >
                        {creatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                        Import & Create Quiz
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
