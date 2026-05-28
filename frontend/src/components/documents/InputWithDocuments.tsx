"use client";

import { useState } from "react";
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
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
        />
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
