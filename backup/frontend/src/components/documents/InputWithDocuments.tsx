"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { DocumentUpload, AttachedDocChip, type UploadedDoc } from "./DocumentUpload";
import { DocumentPicker } from "./DocumentPicker";
import { cn } from "@/lib/cn";

interface InputWithDocumentsProps {
  /** "textarea" for the Ask page, "input" for single-line forms */
  inputType?: "textarea" | "input";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  attachedDocs: UploadedDoc[];
  onDocsChange: (docs: UploadedDoc[]) => void;
  disabled?: boolean;
  className?: string;
}

export function InputWithDocuments({
  inputType = "textarea",
  value,
  onChange,
  placeholder,
  attachedDocs,
  onDocsChange,
  disabled = false,
  className,
}: InputWithDocumentsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevIsTextarea = useRef(false);
  const cursorPositionRef = useRef<number | null>(null);

  const threshold = 60;
  const isTransitionedTextarea = inputType === "input" && value.length >= threshold;
  const isTextareaMode = inputType === "textarea" || isTransitionedTextarea;

  // Preserve focus and cursor position across transition
  useLayoutEffect(() => {
    if (inputType !== "input") return;

    if (isTextareaMode !== prevIsTextarea.current) {
      const cursor = cursorPositionRef.current ?? value.length;
      if (isTextareaMode) {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(cursor, cursor);
        }
      } else {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursor, cursor);
        }
      }
      prevIsTextarea.current = isTextareaMode;
    }
  }, [isTextareaMode, inputType, value]);

  // Poll status of processing attached docs
  useEffect(() => {
    const processingDocs = attachedDocs.filter((d) => d.ocrStatus === "processing");
    if (processingDocs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updatedDocs = await Promise.all(
          processingDocs.map(async (doc) => {
            const res = await fetch(`/api/documents/insights?id=${doc._id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.document) {
                return data.document as UploadedDoc;
              }
            }
            return doc;
          })
        );

        // Merge updated docs back into attachedDocs
        const newAttachedDocs = attachedDocs.map((doc) => {
          const updated = updatedDocs.find((ud) => ud._id === doc._id);
          return updated ? updated : doc;
        });

        // Check if anything actually changed to avoid infinite loop
        const changed = newAttachedDocs.some((doc, idx) => {
          return doc.ocrStatus !== attachedDocs[idx].ocrStatus || doc.ocrError !== attachedDocs[idx].ocrError;
        });

        if (changed) {
          onDocsChange(newAttachedDocs);
        }
      } catch (err) {
        console.warn("[InputWithDocuments] Failed to update attached doc status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [attachedDocs, onDocsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    cursorPositionRef.current = e.target.selectionStart;
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isTransitionedTextarea && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleUploadComplete = (doc: UploadedDoc) => {
    if (!attachedDocs.some((d) => d._id === doc._id)) {
      onDocsChange([...attachedDocs, doc]);
    }
    setUploadError("");
  };

  const handleRemoveDoc = (id: string) => {
    onDocsChange(attachedDocs.filter((d) => d._id !== id));
  };

  const handlePickerSelect = (docs: UploadedDoc[]) => {
    const existing = new Set(attachedDocs.map((d) => d._id));
    const merged = [
      ...attachedDocs,
      ...docs.filter((d) => !existing.has(d._id)),
    ];
    onDocsChange(merged);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Text input */}
      {inputType === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none disabled:opacity-50"
        />
      ) : (
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-300 ease-out focus-within:border-[var(--accent)]",
            isTransitionedTextarea ? "h-[110px]" : "h-[46px]"
          )}
        >
          {isTransitionedTextarea ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="absolute inset-0 w-full h-full px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none disabled:opacity-50 bg-transparent"
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className="absolute inset-0 w-full h-full px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50 bg-transparent"
            />
          )}
        </div>
      )}

      {/* Attached docs */}
      {attachedDocs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachedDocs.map((doc) => (
            <AttachedDocChip
              key={doc._id}
              doc={doc}
              onRemove={handleRemoveDoc}
            />
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <DocumentUpload
            compact
            onUploadComplete={handleUploadComplete}
            onError={setUploadError}
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-all disabled:opacity-50"
          >
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
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>From library</span>
          </button>
        </div>

        {inputType === "input" && value.length > 0 && (
          <div className="flex items-center gap-2 text-xs transition-all duration-300">
            {isTransitionedTextarea ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/10 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                ✨ Auto-expanded to paragraph
              </span>
            ) : (
              <span className="text-[var(--text-muted)] font-medium">
                {value.length} / {threshold} characters
              </span>
            )}
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-[var(--danger)]">{uploadError}</p>
      )}

      <DocumentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        selectedIds={attachedDocs.map((d) => d._id)}
      />
    </div>
  );
}

