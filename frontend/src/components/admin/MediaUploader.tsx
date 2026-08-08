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
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Upload failed');
      } finally {
        setProgress(null);
      }
    },
    [kind, onChange]
  );

  return (
    <div className="space-y-3">
      {value ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-sunken)] overflow-hidden">
          <div className="relative">
            {kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Uploaded preview" className="w-full max-h-72 object-contain bg-[var(--surface-sunken)]" />
            ) : (
              <video src={value} controls className="w-full max-h-72 bg-black" />
            )}
            <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border border-[var(--line)] text-[var(--ink-500)] hover:text-[var(--danger)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border-t border-[var(--line)]">
            <LinkIcon className="w-3.5 h-3.5 text-[var(--ink-300)] shrink-0" />
            <span className="flex-1 min-w-0 truncate text-xs text-[var(--text-muted)]">{value}</span>
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
          className={`flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-[var(--radius-md)] border border-dashed cursor-pointer transition-colors ${
            isDragging ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]/40' : 'border-[var(--line)] bg-[var(--surface-page)] hover:border-[var(--brand-gold)]'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-[var(--brand-gold-600)] animate-spin" />
              <span className="text-sm text-[var(--text-muted)]">Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-6 h-6 text-[var(--brand-gold-600)]" />
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
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none"
      />
    </div>
  );
}
