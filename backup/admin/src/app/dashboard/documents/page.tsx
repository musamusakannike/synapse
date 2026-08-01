"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { formatDate, formatBytes, cn } from "@/lib/utils";
import { FileText, Trash2, Eye, Loader2, Info } from "lucide-react";

interface DocumentRow {
  _id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  userId: string;
  userName: string;
  userEmail: string;
  hasInsights: boolean;
  createdAt: string;
}

interface DocumentDetail {
  _id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  insights?: {
    summary?: string;
    keyPoints?: string[];
    qa?: { question: string; answer: string }[];
  } | string;
}

const columns = [
  { key: "filename", label: "File Name" },
  { key: "user", label: "Uploaded By" },
  { key: "type", label: "Type" },
  { key: "size", label: "Size" },
  { key: "insights", label: "AI Insights" },
  { key: "created", label: "Uploaded" },
  { key: "actions", label: "" },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(null);
  const [docDetail, setDocDetail] = useState<DocumentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete Modal
  const [deleteDoc, setDeleteDoc] = useState<DocumentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });
      const res = await fetch(`/api/admin/documents?${params}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchDocDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/documents/${id}`);
      const data = await res.json();
      if (data.success) {
        setDocDetail(data.document);
      }
    } catch {
      // Silently fail
    }
    setLoadingDetail(false);
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/documents/${deleteDoc._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteDoc(null);
        fetchDocuments();
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  };

  // Helper for file type icons/badges
  const renderFileType = (mime: string) => {
    if (mime.includes("pdf")) return <span className="badge badge-danger text-[10px]">PDF</span>;
    if (mime.includes("word") || mime.includes("officedocument.word") || mime.includes("msword"))
      return <span className="badge badge-warning text-[10px]">DOCX</span>;
    if (mime.includes("text") || mime.includes("plain"))
      return <span className="badge badge-neutral text-[10px]">TXT</span>;
    return <span className="badge badge-neutral text-[10px]">FILE</span>;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Documents
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Monitor and manage user-uploaded learning documents.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={documents as unknown as Record<string, unknown>[]}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by file name…"
        loading={loading}
        emptyMessage="No documents found."
        renderRow={(item) => {
          const doc = item as unknown as DocumentRow;
          return (
            <tr key={doc._id}>
              <td>
                <div className="flex items-center gap-2 max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] border border-[var(--border-subtle)]">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-[var(--text-primary)] block truncate" title={doc.fileName}>
                      {doc.fileName}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-xs">
                  <span className="font-medium block text-[var(--text-secondary)] truncate max-w-[120px]">
                    {doc.userName}
                  </span>
                  <span className="text-[var(--text-muted)] block truncate max-w-[120px]">
                    {doc.userEmail}
                  </span>
                </div>
              </td>
              <td>{renderFileType(doc.mimeType)}</td>
              <td className="text-xs text-[var(--text-secondary)]">{formatBytes(doc.sizeBytes)}</td>
              <td>
                {doc.hasInsights ? (
                  <span className="badge badge-success text-[10px]">Processed</span>
                ) : (
                  <span className="badge badge-neutral text-[10px]">No Insights</span>
                )}
              </td>
              <td className="text-xs">{formatDate(doc.createdAt)}</td>
              <td>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      fetchDocDetail(doc._id);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    title="View details & insights"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteDoc(doc)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(248,113,113,0.1)] hover:text-[var(--danger)] transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Document Detail & Insights Modal */}
      <Modal
        open={!!selectedDoc}
        onClose={() => {
          setSelectedDoc(null);
          setDocDetail(null);
        }}
        title="Document Details & AI Insights"
        maxWidth="max-w-2xl"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{selectedDoc.fileName}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1">
                <div>
                  <span className="text-[var(--text-muted)]">File Size:</span>{" "}
                  <span className="font-medium text-[var(--text-secondary)]">{formatBytes(selectedDoc.sizeBytes)}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Format:</span>{" "}
                  <span className="font-medium text-[var(--text-secondary)]">{selectedDoc.mimeType}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Uploader:</span>{" "}
                  <span className="font-medium text-[var(--text-secondary)]">{selectedDoc.userName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Upload Date:</span>{" "}
                  <span className="font-medium text-[var(--text-secondary)]">{formatDate(selectedDoc.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4">
              {loadingDetail ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                  <span className="text-xs text-[var(--text-muted)]">Loading insights…</span>
                </div>
              ) : docDetail?.insights ? (
                <div className="space-y-4">
                  {typeof docDetail.insights === "object" ? (
                    <>
                      {docDetail.insights.summary && (
                        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5">
                          <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
                            Document Summary
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {docDetail.insights.summary}
                          </p>
                        </div>
                      )}

                      {docDetail.insights.keyPoints && docDetail.insights.keyPoints.length > 0 && (
                        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                          <h4 className="text-xs font-semibold text-[var(--text-primary)]">Key Takeaways</h4>
                          <ul className="space-y-1.5 pl-5 list-disc text-xs text-[var(--text-secondary)]">
                            {docDetail.insights.keyPoints.map((pt, idx) => (
                              <li key={idx} className="leading-relaxed">{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {docDetail.insights.qa && docDetail.insights.qa.length > 0 && (
                        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
                          <h4 className="text-xs font-semibold text-[var(--text-primary)]">AI Q&A Pairs</h4>
                          <div className="space-y-3">
                            {docDetail.insights.qa.map((qaItem, idx) => (
                              <div key={idx} className="space-y-1 border-b border-[var(--border-subtle)] last:border-b-0 pb-2.5 last:pb-0">
                                <p className="text-xs font-medium text-[var(--accent)]">Q: {qaItem.question}</p>
                                <p className="text-xs text-[var(--text-secondary)] pl-3 leading-relaxed">A: {qaItem.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">Processed Insights</h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {docDetail.insights}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
                  No structured AI insights available for this document.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[var(--border-subtle)] pt-3 mt-4">
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setDocDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        title="Delete Document"
      >
        {deleteDoc && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
              <p className="text-sm text-[var(--danger)] font-medium mb-1">
                ⚠️ Destructive action.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Are you sure you want to permanently delete the document <strong>{deleteDoc.fileName}</strong>?
                This will delete the file record and all its associated AI summaries and insights from the database.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDoc(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Document
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
