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
import { GripVertical, Trash2, Plus, Type, Sigma, Video, Music, Play, Image as ImageIcon, Code2, HelpCircle, Terminal, Layers } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import MediaUploader from '@/components/admin/MediaUploader';
import { TopicContent, TopicContentType, TopicQuizOption } from '@/lib/types';

const CONTENT_TYPES: { type: TopicContentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'latex', label: 'LaTeX', icon: Sigma },
  { type: 'code', label: 'Code', icon: Code2 },
  { type: 'youtube', label: 'YouTube', icon: Play },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'audio', label: 'Audio', icon: Music },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle },
  { type: 'exercise', label: 'Exercise', icon: Terminal },
  { type: 'group', label: 'Multi-Block Group', icon: Layers },
];

const ICON_MAP: Record<TopicContentType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  latex: Sigma,
  code: Code2,
  youtube: Play,
  image: ImageIcon,
  video: Video,
  audio: Music,
  quiz: HelpCircle,
  exercise: Terminal,
  group: Layers,
};

const CODE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'sql', 'bash', 'other'];
const EXERCISE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'sql', 'bash', 'other'];

function QuizBlockEditor({ block, onQuizChange }: { block: TopicContent; onQuizChange: (quiz: NonNullable<TopicContent['quiz']>) => void }) {
  const quiz = block.quiz || { question: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }], explanation: '' };

  const updateOption = (i: number, patch: Partial<TopicQuizOption>) => {
    onQuizChange({ ...quiz, options: quiz.options.map((o, oi) => (oi === i ? { ...o, ...patch } : o)) });
  };

  const addOption = () => {
    if (quiz.options.length >= 6) return;
    onQuizChange({ ...quiz, options: [...quiz.options, { text: '', isCorrect: false }] });
  };

  const removeOption = (i: number) => {
    if (quiz.options.length <= 2) return;
    onQuizChange({ ...quiz, options: quiz.options.filter((_, oi) => oi !== i) });
  };

  return (
    <div className="space-y-3">
      <textarea
        value={quiz.question}
        onChange={(e) => onQuizChange({ ...quiz, question: e.target.value })}
        placeholder="Question"
        rows={2}
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none"
      />
      <div className="space-y-2">
        {quiz.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={opt.isCorrect}
              onChange={() => onQuizChange({ ...quiz, options: quiz.options.map((o, oi) => ({ ...o, isCorrect: oi === i })) })}
              aria-label="Correct answer"
            />
            <input
              type="text"
              value={opt.text}
              onChange={(e) => updateOption(i, { text: e.target.value })}
              placeholder={`Option ${i + 1}`}
              className="flex-1 px-3 py-2 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors"
            />
            <button onClick={() => removeOption(i)} disabled={quiz.options.length <= 2} className="text-[var(--ink-300)] hover:text-[var(--danger)] disabled:opacity-30 cursor-pointer" aria-label="Remove option">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={addOption} disabled={quiz.options.length >= 6} className="text-sm text-[var(--brand-gold-600)] hover:opacity-80 disabled:opacity-30 cursor-pointer">
          + Add option
        </button>
      </div>
      <textarea
        value={quiz.explanation || ''}
        onChange={(e) => onQuizChange({ ...quiz, explanation: e.target.value })}
        placeholder="Explanation shown after answering (optional)"
        rows={2}
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none"
      />
    </div>
  );
}

function ExerciseBlockEditor({ block, onExerciseChange }: { block: TopicContent; onExerciseChange: (exercise: NonNullable<TopicContent['exercise']>) => void }) {
  const exercise = block.exercise || { instructions: '', starterCode: '', language: 'python', expectedOutput: '', solution: '' };

  return (
    <div className="space-y-3">
      <textarea
        value={exercise.instructions}
        onChange={(e) => onExerciseChange({ ...exercise, instructions: e.target.value })}
        placeholder="Instructions for the learner"
        rows={2}
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none"
      />
      <Select
        label="Language"
        value={exercise.language || 'python'}
        onChange={(e) => onExerciseChange({ ...exercise, language: e.target.value })}
        options={EXERCISE_LANGUAGES}
      />
      {exercise.language !== 'python' && (
        <p className="text-xs text-[var(--text-muted)]">Only Python exercises are runnable in-app right now; other languages render as a read-only code block.</p>
      )}
      <textarea
        value={exercise.starterCode}
        onChange={(e) => onExerciseChange({ ...exercise, starterCode: e.target.value })}
        placeholder={'Starter code, e.g. print("   ")'}
        rows={6}
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none font-mono"
      />
      <textarea
        value={exercise.expectedOutput || ''}
        onChange={(e) => onExerciseChange({ ...exercise, expectedOutput: e.target.value })}
        placeholder="Expected output (matched against the learner's stdout, optional)"
        rows={2}
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none font-mono"
      />
      <textarea
        value={exercise.solution || ''}
        onChange={(e) => onExerciseChange({ ...exercise, solution: e.target.value })}
        placeholder="Reference solution (admin-only, not shown to learners)"
        rows={3}
        className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors resize-none font-mono"
      />
    </div>
  );
}

function GroupBlockEditor({ block, onBlocksChange, onTitleChange }: { block: TopicContent; onBlocksChange: (blocks: TopicContent[]) => void; onTitleChange: (title: string) => void }) {
  const childBlocks = block.blocks || [];

  const handleAddChild = (type: TopicContentType) => {
    if (type === 'group') return;
    const newChild: TopicContent = { type, content: type === 'code' ? '' : '' };
    if (type === 'code') newChild.language = 'python';
    onBlocksChange([...childBlocks, newChild]);
  };

  const handleUpdateChild = (idx: number, patch: Partial<TopicContent>) => {
    onBlocksChange(childBlocks.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const handleRemoveChild = (idx: number) => {
    onBlocksChange(childBlocks.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3 bg-[var(--surface-sunken)] p-3.5 rounded-[var(--radius-md)] border border-[var(--line)]">
      <input
        type="text"
        value={block.content}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Group Section Title (e.g. Concept Overview)"
        className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--ink-900)] outline-none"
      />
      <div className="text-xs font-semibold text-[var(--ink-500)] uppercase tracking-wide">
        Nested Blocks ({childBlocks.length})
      </div>
      {childBlocks.map((child, idx) => (
        <div key={idx} className="bg-[var(--surface-card)] p-3 rounded-[var(--radius-sm)] border border-[var(--line)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[var(--brand-gold-600)]">{child.type}</span>
            <button onClick={() => handleRemoveChild(idx)} className="text-[var(--ink-300)] hover:text-[var(--danger)] cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {child.type === 'text' || child.type === 'code' || child.type === 'latex' ? (
            <textarea
              value={child.content}
              onChange={(e) => handleUpdateChild(idx, { content: e.target.value })}
              placeholder={`Enter ${child.type} content...`}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--surface-page)] border border-[var(--line)] rounded-[var(--radius-sm)] text-xs font-mono text-[var(--ink-900)] outline-none resize-none"
            />
          ) : child.type === 'image' || child.type === 'video' || child.type === 'youtube' || child.type === 'audio' ? (
            <input
              type="text"
              value={child.content}
              onChange={(e) => handleUpdateChild(idx, { content: e.target.value })}
              placeholder={`URL for ${child.type}...`}
              className="w-full px-3 py-2 bg-[var(--surface-page)] border border-[var(--line)] rounded-[var(--radius-sm)] text-xs text-[var(--ink-900)] outline-none"
            />
          ) : null}
        </div>
      ))}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {['text', 'code', 'latex', 'image', 'youtube'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleAddChild(t as TopicContentType)}
            className="px-2.5 py-1 text-xs bg-[var(--surface-card)] border border-[var(--line)] hover:border-[var(--brand-gold-600)] rounded-[var(--radius-sm)] font-medium cursor-pointer"
          >
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SortableBlockProps {
  block: TopicContent;
  index: number;
  onChange: (content: string) => void;
  onLanguageChange: (language: string) => void;
  onQuizChange: (quiz: NonNullable<TopicContent['quiz']>) => void;
  onExerciseChange: (exercise: NonNullable<TopicContent['exercise']>) => void;
  onBlocksChange?: (blocks: TopicContent[]) => void;
  onRemove: () => void;
}

function SortableBlock({ block, index, onChange, onLanguageChange, onQuizChange, onExerciseChange, onBlocksChange, onRemove }: SortableBlockProps) {
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
            : block.type === 'quiz'
              ? 'Quiz'
              : block.type === 'exercise'
                ? 'Exercise'
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

            {(block.type === 'quiz' || block.type === 'exercise') && (
              <input
                type="text"
                value={block.content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Step title (shown at the top of the step)"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors font-semibold"
              />
            )}

            {block.type === 'group' ? (
              <GroupBlockEditor block={block} onBlocksChange={(b) => onBlocksChange?.(b)} onTitleChange={(t) => onChange(t)} />
            ) : block.type === 'quiz' ? (
              <QuizBlockEditor block={block} onQuizChange={onQuizChange} />
            ) : block.type === 'exercise' ? (
              <ExerciseBlockEditor block={block} onExerciseChange={onExerciseChange} />
            ) : block.type === 'text' || block.type === 'latex' || block.type === 'code' ? (
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
    if (type === 'code') {
      onChange([...contents, { type, content: '', language: 'other' }]);
    } else if (type === 'group') {
      onChange([...contents, { type, content: 'Group Section', blocks: [{ type: 'text', content: '' }] }]);
    } else if (type === 'quiz') {
      onChange([
        ...contents,
        { type, content: 'Quiz', quiz: { question: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }], explanation: '' } },
      ]);
    } else if (type === 'exercise') {
      onChange([
        ...contents,
        { type, content: 'Exercise', exercise: { instructions: '', starterCode: '', language: 'python', expectedOutput: '', solution: '' } },
      ]);
    } else {
      onChange([...contents, { type, content: '' }]);
    }
    setShowAddMenu(false);
  };

  const handleBlockChange = (index: number, content: string) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, content } : c)));
  };

  const handleLanguageChange = (index: number, language: string) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, language } : c)));
  };

  const handleQuizChange = (index: number, quiz: NonNullable<TopicContent['quiz']>) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, quiz } : c)));
  };

  const handleExerciseChange = (index: number, exercise: NonNullable<TopicContent['exercise']>) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, exercise } : c)));
  };

  const handleBlocksChange = (index: number, blocks: TopicContent[]) => {
    onChange(contents.map((c, i) => (i === index ? { ...c, blocks } : c)));
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
                onQuizChange={(quiz) => handleQuizChange(index, quiz)}
                onExerciseChange={(exercise) => handleExerciseChange(index, exercise)}
                onBlocksChange={(blocks) => handleBlocksChange(index, blocks)}
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
