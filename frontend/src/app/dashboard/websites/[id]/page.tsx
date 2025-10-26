"use client";

import React, { useEffect, useState } from "react";
import StyledMarkdown from "@/components/StyledMarkdown";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WebsiteAPI } from "@/lib/api";
import { ArrowLeft, Globe, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import Loader from "@/components/Loader";

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

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"rescrape" | "delete" | null>(null);
  const [showMore, setShowMore] = useState({ summary: false, content: false });

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await WebsiteAPI.get(id);
      setSite(data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const rescrape = async () => {
    if (!site) return;
    try {
      setAction("rescrape");
      await WebsiteAPI.rescrape(site._id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setAction(null);
    }
  };

  const remove = async () => {
    if (!site) return;
    if (!confirm("Delete this website?")) return;
    try {
      setAction("delete");
      await WebsiteAPI.delete(site._id);
      router.push("/dashboard/websites");
    } catch (e) {
      console.error(e);
    } finally {
      setAction(null);
    }
  };

  const statusBadge = (s?: Site["processingStatus"]) => {
    const cls =
      s === "completed"
        ? "text-green-700 bg-green-50 border-green-200"
        : s === "failed"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-amber-700 bg-amber-50 border-amber-200";
    return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{s}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/websites" className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button onClick={load} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader size="md" />
        </div>
      ) : !site ? (
        <p className="text-gray-600">Website not found.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate" title={site.title || site.url}>
                {site.title || site.url}
              </h1>
              <p className="text-sm text-gray-600 truncate">{site.url}</p>
              <div className="mt-2 flex items-center gap-2">
                {statusBadge(site.processingStatus)}
                {site.scrapedAt && (
                  <span className="text-xs text-gray-500">Last scraped: {new Date(site.scrapedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={rescrape}
              disabled={action === "rescrape"}
              className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
            >
              {action === "rescrape" ? <Loader /> : <RotateCcw className="w-4 h-4" />}
              Rescrape
            </button>
            <button
              onClick={remove}
              disabled={action === "delete"}
              className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>

          {site.processingError && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3">
              {site.processingError}
            </div>
          )}

          {site.summary && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <div className={!showMore.summary ? "line-clamp-8" : ""}>
                <StyledMarkdown>{site.summary}</StyledMarkdown>
              </div>
              <button
                onClick={() => setShowMore((p) => ({ ...p, summary: !p.summary }))}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showMore.summary ? "Show Less" : "Read More"}
              </button>
            </div>
          )}

          {site.extractedContent && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Extracted Content</h3>
              <div className={!showMore.content ? "line-clamp-8" : ""}>
                <StyledMarkdown>{site.extractedContent}</StyledMarkdown>
              </div>
              <button
                onClick={() => setShowMore((p) => ({ ...p, content: !p.content }))}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showMore.content ? "Show Less" : "Read More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
