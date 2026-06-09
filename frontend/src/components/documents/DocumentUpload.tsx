"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

export interface UploadedDoc {
  _id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  ocrStatus?: "pending" | "processing" | "completed" | "failed";
  ocrError?: string | null;
  createdAt: string;
}

interface DocumentUploadProps {
  onUploadComplete: (doc: UploadedDoc) => void;
  onError?: (error: string) => void;
  compact?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "text/plain",
  "text/markdown",
].join(",");

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({
  onUploadComplete,
  onError,
  compact = false,
  className,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      console.log(`[DocumentUpload Component] Starting upload for file: "${file.name}" (Type: ${file.type}, Size: ${file.size} bytes)`);

      try {
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<UploadedDoc>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 90);
              setProgress(pct);
              console.log(`[DocumentUpload Component] Upload progress for "${file.name}": ${pct}%`);
            }
          };

          xhr.onload = () => {
            setProgress(100);
            console.log(`[DocumentUpload Component] Response received for "${file.name}". HTTP status: ${xhr.status}`);
            try {
              const data = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300 && data.success) {
                console.log(`[DocumentUpload Component] Upload succeeded for "${file.name}". Response:`, data);
                resolve(data.document);
              } else {
                console.error(`[DocumentUpload Component] Upload failed for "${file.name}". Error returned: ${data.error || "Unknown error"}`);
                reject(new Error(data.error || "Upload failed"));
              }
            } catch (err) {
              console.error(`[DocumentUpload Component] Failed to parse JSON response for "${file.name}". Response text:`, xhr.responseText);
              reject(new Error("Invalid response from server"));
            }
          };

          xhr.onerror = () => {
            console.error(`[DocumentUpload Component] Network error during upload of "${file.name}"`);
            reject(new Error("Network error during upload"));
          };
          
          xhr.open("POST", "/api/documents/upload");
          xhr.send(formData);
        });

        const doc = await uploadPromise;
        onUploadComplete(doc);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        console.error(`[DocumentUpload Component] Upload failed: ${message}`, err);
        onError?.(message);
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onUploadComplete, onError]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-all disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span>{progress}%</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload file</span>
            </>
          )}
        </button>
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-200",
        dragOver
          ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
          : "border-[var(--border)] hover:border-[var(--text-muted)]",
        uploading && "pointer-events-none opacity-70",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div className="flex flex-col items-center justify-center p-6 gap-3">
        {uploading ? (
          <>
            <div className="w-10 h-10 rounded-full border-3 border-[var(--accent)] border-t-transparent animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">
              Uploading... {progress}%
            </p>
            <div className="w-full max-w-xs h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Click to upload
              </button>
              <span className="text-sm text-[var(--text-muted)]">
                {" "}
                or drag & drop
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              PDF, DOCX, images (PNG, JPEG, WebP), TXT — up to 20 MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

interface AttachedDocChipProps {
  doc: UploadedDoc;
  onRemove: (id: string) => void;
}

function mimeIcon(mime: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("word")) return "DOC";
  if (mime.startsWith("image/")) return "IMG";
  return "TXT";
}

export function AttachedDocChip({ doc, onRemove }: AttachedDocChipProps) {
  return (
    <div className={cn(
      "group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors",
      doc.ocrStatus === "failed" 
        ? "bg-[var(--danger)]/5 border-[var(--danger)]/20" 
        : "bg-[var(--bg-tertiary)] border-[var(--border)]"
    )}>
      <span className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0",
        doc.ocrStatus === "failed"
          ? "bg-[var(--danger)]/10 text-[var(--danger)]"
          : "bg-[var(--accent-muted)] text-[var(--accent)]"
      )}>
        {mimeIcon(doc.mimeType)}
      </span>
      <span className="text-[var(--text-secondary)] truncate max-w-[140px] flex items-center gap-1.5">
        {doc.fileName}
        {doc.ocrStatus === "processing" && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" title="Reading file..." />
        )}
        {doc.ocrStatus === "failed" && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" title="Could not read file" />
        )}
      </span>
      <span className="text-[var(--text-muted)]">
        {formatFileSize(doc.sizeBytes)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(doc._id)}
        className="ml-1 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
