"use client";

import React, { useEffect, useState } from "react";
import { DocumentAPI } from "@/lib/api";
import { FileText, UploadCloud, RefreshCw, Trash2 } from "lucide-react";
import Loader from "@/components/Loader";

type Doc = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  summary?: string;
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  processingError?: string;
  createdAt?: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await DocumentAPI.list();
      setDocs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      if (prompt.trim()) fd.append("prompt", prompt.trim());
      await DocumentAPI.upload(fd);
      setFile(null);
      setPrompt("");
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const reprocess = async (id: string) => {
    try {
      setActionId(id);
      await DocumentAPI.reprocess(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      setActionId(id);
      await DocumentAPI.delete(id);
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600">
          Upload and summarize your study materials
        </p>
      </div>

      {/* Upload Card */}
      <form
        onSubmit={onUpload}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-200 rounded px-3 py-2"
                  accept=".pdf,.docx,.txt,.md,.csv,.json,.pptx"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Optional: custom summary prompt"
                  className="w-full border border-gray-200 rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                disabled={!file || uploading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {uploading ? <Loader /> : <UploadCloud className="w-4 h-4" />}
                Upload & summarize
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Your documents
          </h2>
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
        ) : docs.length === 0 ? (
          <p className="text-gray-600">No documents yet. Upload one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((d) => (
              <div
                key={d._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[220px]">
                        {d.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {d.mimeType} • {(d.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      d.processingStatus === "completed"
                        ? "text-green-700 bg-green-50 border-green-200"
                        : d.processingStatus === "failed"
                        ? "text-red-700 bg-red-50 border-red-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}
                  >
                    {d.processingStatus}
                  </span>
                </div>

                {d.summary && (
                  <p className="text-sm text-gray-700 mt-3 line-clamp-5 whitespace-pre-wrap">
                    {d.summary}
                  </p>
                )}

                {d.processingError && (
                  <p className="text-sm text-red-600 mt-3">
                    {d.processingError}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => reprocess(d._id)}
                    disabled={actionId === d._id}
                    className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    {actionId === d._id ? (
                      <Loader />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Reprocess
                  </button>
                  <button
                    onClick={() => remove(d._id)}
                    disabled={actionId === d._id}
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
    </div>
  );
}
