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
        : await mcqApi.bulkCreate({ topic: topicId, mcqs: parsed as any[] });
      const count = res.data.count || res.data.data?.length || 0;
      toast.success(`${count} ${type} imported`);
      setJsonText('');
      onClose();
      onImported();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import failed');
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
          <label className="block text-sm font-semibold text-[var(--ink-900)] mb-2">JSON data</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={type === 'flashcards' ? flashcardHint : mcqHint}
            rows={10}
            className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none font-mono resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-page)] border border-[var(--line)] hover:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--text-muted)] cursor-pointer">
            <FileJson className="w-4 h-4" />
            Upload .json file
            <input type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />
          </label>
          <span className="text-xs text-[var(--ink-300)]">or paste JSON above</span>
        </div>
        <div className="pt-4 border-t border-[var(--line)]">
          <Button variant="primary" onClick={handleImport} disabled={importing || !jsonText.trim()} fullWidth>
            <Upload className="w-4 h-4" /> {importing ? 'Importing…' : `Import ${type}`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
