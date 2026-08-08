'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Type, Sigma, Video, Music, Play, Image as ImageIcon, Code2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import MediaUploader from '@/components/admin/MediaUploader';
import { TopicContent, TopicContentType } from '@/lib/types';

const CONTENT_TYPES: { type: TopicContentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'latex', label: 'LaTeX', icon: Sigma },
  { type: 'code', label: 'Code', icon: Code2 },
  { type: 'youtube', label: 'YouTube', icon: Play },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'audio', label: 'Audio', icon: Music },
];

const ICON_MAP: Record<TopicContentType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  latex: Sigma,
  code: Code2,
  youtube: Play,
  image: ImageIcon,
  video: Video,
  audio: Music,
};

const CODE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'sql', 'bash', 'other'];

interface SortableBlockProps {
  block: TopicContent;
  index: number;
  onChange: (content: string) => void;
  onLanguageChange: (language: string) => void;
  onRemove: () => void;
}

function SortableBlock({ block, index, onChange, onLanguageChange, onRemove }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: index });
  const Icon = ICON_MAP[block.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const placeholder =
    block.type === 'youtube'
      ? 'https://youtube.com/watch?v=...'
      : block.type === 'audio'
        ? 'https://example.com/audio.mp3'
        : block.type === 'latex'
          ? 'Enter LaTeX formula (e.g. \\frac{a}{b})'
          : block.type === 'code'
            ? 'Enter code…'
            : 'Enter text content...';

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-2 cursor-grab active:cursor-grabbing text-[var(--ink-300)] hover:text-[var(--ink-900)] transition-colors touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[var(--brand-gold-600)]" />
                <Badge tone="gold">{block.type}</Badge>
              </div>
              <button onClick={onRemove} className="text-[var(--ink-300)] hover:text-[var(--danger)] transition-colors cursor-pointer" aria-label="Remove block">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {block.type === 'code' && (
              <Select
                label="Language"
                value={block.language || 'other'}
                onChange={(e) => onLanguageChange(e.target.value)}
                options={CODE_LANGUAGES}
              />
            )}

            {block.type === 'text' || block.type === 'latex' || block.type === 'code' ? (
              <textarea
                value={block.content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={block.type === 'latex' ? 3 : block.type === 'code' ? 8 : 5}
                className={`w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none ${
                  block.type === 'latex' || block.type === 'code' ? 'font-mono' : ''
                }`}
              />
            ) : block.type === 'image' || block.type === 'video' ? (
              <MediaUploader kind={block.type} value={block.content} onChange={onChange} />
            ) : (
              <input
                type="url"
                value={block.content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

interface ContentBlockEditorProps {
  contents: TopicContent[];
  onChange: (contents: TopicContent[]) => void;
}

export default function ContentBlockEditor({ contents, onChange }: ContentBlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onChange(arrayMove(contents, Number(active.id), Number(over.id)));
    }
  };

  const handleAddBlock = (type: TopicContentType) => {
    onChange([...contents, type === 'code' ? { type, content: '', language: 'other' } : { type, content: '' }]);
    setShowAddMenu(false);
  };

  const handleBlockChange = (index: number, content: string) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, content } : c)));
  };

  const handleLanguageChange = (index: number, language: string) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, language } : c)));
  };

  const handleBlockRemove = (index: number) => {
    onChange(contents.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={contents.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {contents.map((block, index) => (
              <SortableBlock
                key={index}
                block={block}
                index={index}
                onChange={(content) => handleBlockChange(index, content)}
                onLanguageChange={(language) => handleLanguageChange(index, language)}
                onRemove={() => handleBlockRemove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {contents.length === 0 && (
        <div className="text-center py-8 text-sm text-[var(--text-muted)]">No content blocks yet. Add one below.</div>
      )}

      <div className="relative">
        {showAddMenu ? (
          <div className="flex flex-wrap gap-2 p-3 bg-[var(--surface-page)] border border-[var(--line)] rounded-[var(--radius-md)]">
            {CONTENT_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-card)] border border-[var(--line)] hover:border-[var(--brand-gold)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] transition-all cursor-pointer"
              >
                <Icon className="w-4 h-4 text-[var(--brand-gold-600)]" />
                {label}
              </button>
            ))}
            <button onClick={() => setShowAddMenu(false)} className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)] cursor-pointer">
              Cancel
            </button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setShowAddMenu(true)}>
            <Plus className="w-4 h-4" /> Add content block
          </Button>
        )}
      </div>
    </div>
  );
}
