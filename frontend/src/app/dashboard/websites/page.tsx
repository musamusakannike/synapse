"use client";

import React, { useEffect, useState } from "react";
import { WebsiteAPI } from "@/lib/api";
import { Globe, Link2, RefreshCw, Trash2, RotateCcw } from "lucide-react";
import Loader from "@/components/Loader";
import HelpButton from "@/components/HelpButton";
import { helpConfigs } from "@/config/helpConfigs";

type Site = {
  _id: string;
  url: string;
  title?: string;
  extractedContent?: string;
  summary?: string;
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  processingError?: string;
  scrapedAt?: string;
  createdAt?: string;
};

export default function WebsitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await WebsiteAPI.list();
      setSites(data || []);
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
    if (!url.trim()) return;
    try {
      setCreating(true);
      await WebsiteAPI.create(url.trim());
      setUrl("");
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const rescrape = async (id: string) => {
    try {
      setActionId(id);
      await WebsiteAPI.rescrape(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this website?")) return;
    try {
      setActionId(id);
      await WebsiteAPI.delete(id);
      setSites((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Websites</h1>
        <p className="text-gray-600">
          Summarize website content into study notes
        </p>
      </div>

      {/* Create */}
      <form
        data-help="add-website"
        onSubmit={create}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (https://...)"
            className="flex-1 border border-gray-200 rounded px-3 py-2"
          />
          <button
            disabled={!url.trim() || creating}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {creating ? <Loader /> : <Link2 className="w-4 h-4" />}
            Add
          </button>
        </div>
      </form>

      {/* List */}
      <div data-help="website-list" className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your websites</h2>
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
        ) : sites.length === 0 ? (
          <p className="text-gray-600">No websites yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sites.map((s) => (
              <div
                key={s._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {s.title || s.url}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{s.url}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      s.processingStatus === "completed"
                        ? "text-green-700 bg-green-50 border-green-200"
                        : s.processingStatus === "failed"
                        ? "text-red-700 bg-red-50 border-red-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}
                  >
                    {s.processingStatus}
                  </span>
                </div>

                {s.summary && (
                  <>
                    <p
                      className={`text-sm text-gray-700 mt-3 whitespace-pre-wrap ${
                        !showMore[s._id] && "line-clamp-5"
                      }`}
                    >
                      {s.summary}
                    </p>
                    <button
                      onClick={() =>
                        setShowMore((p) => ({ ...p, [s._id]: !p[s._id] }))
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showMore[s._id] ? "Show Less" : "Read More"}
                    </button>
                  </>
                )}

                {s.processingError && (
                  <p className="text-sm text-red-600 mt-3">
                    {s.processingError}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => rescrape(s._id)}
                    disabled={actionId === s._id}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    {actionId === s._id ? (
                      <Loader />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Rescrape
                  </button>
                  <button
                    onClick={() => remove(s._id)}
                    disabled={actionId === s._id}
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
      
      <HelpButton helpConfig={helpConfigs.websites} />
    </div>
  );
}
