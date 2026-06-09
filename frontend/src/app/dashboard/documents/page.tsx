"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DocumentUpload, type UploadedDoc } from "@/components/documents";
import { FetchError } from "@/components/FetchError";
import { cn } from "@/lib/cn";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeIcon(mime: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("word")) return "DOC";
  if (mime.startsWith("image/")) return "IMG";
  return "TXT";
}

function mimeColor(mime: string) {
  if (mime === "application/pdf") return "text-red-400 bg-red-400/10";
  if (mime.includes("word")) return "text-blue-400 bg-blue-400/10";
  if (mime.startsWith("image/")) return "text-green-400 bg-green-400/10";
  return "text-[var(--accent)] bg-[var(--accent-muted)]";
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setFetchError(false);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments(data.documents || []);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    }
  }, []);

  const retryFetch = useCallback(() => {
    setLoading(true);
    fetchDocuments().finally(() => setLoading(false));
  }, [fetchDocuments]);

  useEffect(() => {
    let cancelled = false;
    fetchDocuments().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [fetchDocuments]);

  // Poll list every 5 seconds if there are any documents still in processing status
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.ocrStatus === "processing");
    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchDocuments();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [documents, fetchDocuments]);

  const handleUploadComplete = (doc: UploadedDoc) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
        Documents
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 sm:mb-8">
        Upload and manage your study materials. Use them with AI Chat, Course Generation, or Quiz Generation.
      </p>

      {/* Upload area */}
      <DocumentUpload
        onUploadComplete={handleUploadComplete}
        className="mb-6 sm:mb-8"
      />

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fetchError ? (
        <FetchError message="Couldn't load your documents." onRetry={retryFetch} />
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-[var(--text-muted)]">
            No documents yet. Upload your first file above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all group"
            >
              {/* Icon */}
              <span
                className={cn(
                  "inline-flex items-center justify-center w-10 h-10 rounded-xl text-xs font-bold shrink-0",
                  mimeColor(doc.mimeType)
                )}
              >
                {mimeIcon(doc.mimeType)}
              </span>

              {/* Info — clickable to navigate to insights */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => router.push(`/dashboard/documents/${doc._id}`)}
              >
                <div className="flex items-center gap-2 max-w-full">
                  <p className="text-sm text-[var(--text-primary)] font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                    {doc.fileName}
                  </p>
                  {doc.ocrStatus === "processing" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/10 animate-pulse shrink-0">
                      Processing OCR
                    </span>
                  )}
                  {doc.ocrStatus === "failed" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/10 shrink-0">
                      OCR Failed
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {formatFileSize(doc.sizeBytes)} &middot;{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => router.push(`/dashboard/documents/${doc._id}`)}
                  className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] bg-[var(--accent-muted)] hover:bg-[var(--accent)]/20 transition-all"
                  title="View Insights"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="hidden sm:inline">Insights</span>
                </button>
                <a
                  href={doc.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                  title="Open file"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <button
                  onClick={() => handleDelete(doc._id)}
                  disabled={deleting === doc._id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === doc._id ? (
                    <div className="w-3.5 h-3.5 border-2 border-[var(--danger)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
