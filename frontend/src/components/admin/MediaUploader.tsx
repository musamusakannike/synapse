'use client';

import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { mediaApi } from '@/lib/api';

type MediaKind = 'image' | 'video';

interface MediaUploaderProps {
  kind: MediaKind;
  value: string;
  onChange: (url: string) => void;
}

const ACCEPT: Record<MediaKind, string> = { image: 'image/*', video: 'video/*' };
const MAX_BYTES: Record<MediaKind, number> = { image: 10 * 1024 * 1024, video: 200 * 1024 * 1024 };

export default function MediaUploader({ kind, value, onChange }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const isUploading = progress !== null;

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith(`${kind}/`)) {
        toast.error(`Please select ${kind === 'image' ? 'an image' : 'a video'} file.`);
        return;
      }
      if (file.size > MAX_BYTES[kind]) {
        toast.error(`File is too large. Max ${Math.round(MAX_BYTES[kind] / (1024 * 1024))}MB.`);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      setProgress(0);
      try {
        const res = await mediaApi.upload(formData);
        onChange(res.data.data.url);
        toast.success('Upload complete');
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Upload failed');
      } finally {
        setProgress(null);
      }
    },
    [kind, onChange]
  );

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-sunken)]">
          <div className="relative">
            {kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Uploaded preview" className="max-h-72 w-full bg-[var(--surface-sunken)] object-contain" />
            ) : (
              <video src={value} controls className="max-h-72 w-full bg-black" />
            )}
            <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 rounded-full border border-[var(--line)] bg-white/90 p-1.5 text-[var(--ink-500)] hover:text-[var(--danger)]">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] px-3 py-2">
            <LinkIcon className="size-3.5 shrink-0 text-[var(--ink-300)]" />
            <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-muted)]">{value}</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) void upload(file); }}
          onClick={() => !isUploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed px-6 py-8 transition-colors ${
            isDragging ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]/40' : 'border-[var(--line)] bg-[var(--surface-page)] hover:border-[var(--brand-gold)]'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-[var(--brand-gold-600)]" />
              <span className="text-sm text-[var(--text-muted)]">Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <UploadCloud className="size-6 text-[var(--brand-gold-600)]" />
              <span className="text-sm text-[var(--ink-900)]">Drag & drop {kind === 'image' ? 'an image' : 'a video'} here</span>
              <span className="text-xs text-[var(--ink-300)]">or click to pick · max {Math.round(MAX_BYTES[kind] / (1024 * 1024))}MB</span>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept={ACCEPT[kind]} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ''; }} />

      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Or paste ${kind} URL`}
        className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
      />
    </div>
  );
}
