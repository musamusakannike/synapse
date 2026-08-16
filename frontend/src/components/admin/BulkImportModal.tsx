'use client';

import React, { useState } from 'react';
import { flashcardApi, mcqApi } from '@/lib/api';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { Upload, FileJson } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  type: 'flashcards' | 'mcqs';
  onImported: () => void;
}

export default function BulkImportModal({ isOpen, onClose, topicId, type, onImported }: BulkImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  const flashcardHint = `[\n  { "question": "What is a variable?", "answer": "A named container for a value." }\n]`;
  const mcqHint = `[\n  {\n    "question": "Which keyword declares a constant in JS?",\n    "options": [\n      { "text": "const", "isCorrect": true },\n      { "text": "var", "isCorrect": false }\n    ],\n    "explanation": "const declares a block-scoped, reassignment-free binding."\n  }\n]`;

  const handleImport = async () => {
    let parsed: unknown[];
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error('JSON must be a non-empty array');
        return;
      }
    } catch {
      toast.error('Invalid JSON format');
      return;
    }

    setImporting(true);
    try {
      const res = type === 'flashcards'
        ? await flashcardApi.bulkCreate({ topic: topicId, flashcards: parsed as { question: string; answer: string }[] })
        : await mcqApi.bulkCreate({ topic: topicId, mcqs: parsed as Partial<import('@/lib/types').MCQ>[] });
      const count = res.data.count || res.data.data?.length || 0;
      toast.success(`${count} ${type} imported`);
      setJsonText('');
      onClose();
      onImported();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJsonText(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title={`Bulk import ${type}`} maxWidth="600px">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--ink-900)]">JSON data</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={type === 'flashcards' ? flashcardHint : mcqHint}
            rows={10}
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 font-mono text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-muted)] hover:border-[var(--ink-900)]">
            <FileJson className="size-4" />
            Upload .json file
            <input type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />
          </label>
          <span className="text-xs text-[var(--ink-300)]">or paste JSON above</span>
        </div>
        <div className="border-t border-[var(--line)] pt-4">
          <Button variant="primary" onClick={handleImport} disabled={importing || !jsonText.trim()} fullWidth>
            <Upload className="size-4" /> {importing ? 'Importing…' : `Import ${type}`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
