'use client';

import React from 'react';
import { Plus, Trash2, HelpCircle, Code2, Type, ChevronUp, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Exercise, Question } from '@/lib/types';

const CODE_LANGUAGES = ['javascript', 'python', 'typescript', 'java', 'c', 'cpp', 'sql', 'bash', 'other'];

interface ExerciseEditorProps {
  exercise: Exercise | undefined;
  onChange: (exercise: Exercise) => void;
}

export default function ExerciseEditor({ exercise, onChange }: ExerciseEditorProps) {
  const currentExercise: Exercise = exercise || {
    title: '',
    instructions: '',
    questions: [],
  };

  const updateExercise = (patch: Partial<Exercise>) => {
    onChange({
      ...currentExercise,
      ...patch,
    });
  };

  const addQuestion = (type: 'mcq' | 'fill_in_blank' | 'code_execution') => {
    const newQuestion: Question = {
      type,
      question: '',
      correctAnswer: type === 'mcq' ? 'Option 1' : '',
      options: type === 'mcq' ? ['Option 1', 'Option 2'] : undefined,
      explanation: '',
      starterCode: type === 'code_execution' ? '// Write your solution here\n' : undefined,
      expectedOutput: type === 'code_execution' ? '' : undefined,
      language: type === 'code_execution' ? 'javascript' : undefined,
      xp: 20,
    };

    updateExercise({
      questions: [...(currentExercise.questions || []), newQuestion],
    });
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    const updated = (currentExercise.questions || []).map((q, i) => (i === index ? { ...q, ...patch } : q));
    updateExercise({ questions: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = (currentExercise.questions || []).filter((_, i) => i !== index);
    updateExercise({ questions: updated });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const list = [...(currentExercise.questions || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [removed] = list.splice(index, 1);
    list.splice(targetIdx, 0, removed);
    updateExercise({ questions: list });
  };

  const questions = currentExercise.questions || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Assessment Title"
          placeholder="e.g. Chapter 1 Mastery Challenge"
          value={currentExercise.title || ''}
          onChange={(e) => updateExercise({ title: e.target.value })}
        />
        <Input
          label="Instructions"
          placeholder="e.g. Complete all questions to pass and earn XP."
          value={currentExercise.instructions || ''}
          onChange={(e) => updateExercise({ instructions: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--ink-900)]">
              Questions ({questions.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Learners must score 50%+ to pass this exercise and unlock subsequent units.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addQuestion('mcq')}
            >
              <HelpCircle className="size-3.5 text-[var(--brand-gold-600)]" />
              <span>+ MCQ</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addQuestion('fill_in_blank')}
            >
              <Type className="size-3.5 text-blue-600" />
              <span>+ Fill-in-Blank</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addQuestion('code_execution')}
            >
              <Code2 className="size-3.5 text-emerald-600" />
              <span>+ Code Execution</span>
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center">
            <HelpCircle className="mx-auto mb-2 size-8 text-[var(--ink-300)]" />
            <p className="text-sm font-semibold text-[var(--ink-900)]">No questions in this assessment yet</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Click any of the buttons above to add Multiple Choice, Fill-in-the-blank, or Code Execution questions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={idx} className="space-y-4 p-5">
                {/* Question Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand-gold-100)] text-xs font-bold text-[var(--brand-gold-600)]">
                      {idx + 1}
                    </span>
                    <Badge tone={q.type === 'mcq' ? 'gold' : q.type === 'code_execution' ? 'success' : 'neutral'}>
                      {q.type === 'mcq' ? 'MCQ' : q.type === 'code_execution' ? 'Code Execution' : 'Fill in Blank'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">XP:</span>
                      <input
                        type="number"
                        min="0"
                        value={q.xp || 20}
                        onChange={(e) => updateQuestion(idx, { xp: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-16 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-page)] px-2 py-1 text-center text-xs font-bold text-[var(--ink-900)] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuestion(idx, 'up')}
                      className="cursor-pointer rounded p-1 text-[var(--ink-300)] hover:text-[var(--ink-900)] disabled:opacity-20"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => moveQuestion(idx, 'down')}
                      className="cursor-pointer rounded p-1 text-[var(--ink-300)] hover:text-[var(--ink-900)] disabled:opacity-20"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="cursor-pointer rounded p-1 text-[var(--ink-300)] hover:text-[var(--danger)]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--ink-900)]">Question Prompt</span>
                  <textarea
                    rows={2}
                    placeholder="Enter the question or problem statement..."
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                    className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                  />
                </div>

                {/* MCQ Question Body */}
                {q.type === 'mcq' && (
                  <div className="space-y-2 rounded-xl bg-[var(--surface-sunken)] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink-900)]">
                        Options (Select radio for the correct answer)
                      </span>
                      {(q.options?.length || 0) < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            const opts = [...(q.options || [])];
                            opts.push(`Option ${opts.length + 1}`);
                            updateQuestion(idx, { options: opts });
                          }}
                          className="cursor-pointer text-xs font-semibold text-[var(--brand-gold-600)] hover:underline"
                        >
                          + Add option
                        </button>
                      )}
                    </div>
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === opt;
                      return (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`q_${idx}_correct`}
                            checked={isCorrect}
                            onChange={() => updateQuestion(idx, { correctAnswer: opt })}
                            className="size-4 accent-[var(--brand-gold)]"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(q.options || [])];
                              const oldVal = newOpts[optIdx];
                              newOpts[optIdx] = e.target.value;
                              const patch: Partial<Question> = { options: newOpts };
                              if (q.correctAnswer === oldVal) {
                                patch.correctAnswer = e.target.value;
                              }
                              updateQuestion(idx, patch);
                            }}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-card)] px-3 py-1.5 text-xs text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                          />
                          {(q.options?.length || 0) > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = (q.options || []).filter((_, i) => i !== optIdx);
                                const patch: Partial<Question> = { options: newOpts };
                                if (q.correctAnswer === opt && newOpts.length > 0) {
                                  patch.correctAnswer = newOpts[0];
                                }
                                updateQuestion(idx, patch);
                              }}
                              className="text-[var(--ink-300)] hover:text-[var(--danger)]"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Fill-in-the-Blank Body */}
                {q.type === 'fill_in_blank' && (
                  <div className="space-y-1.5 rounded-xl bg-[var(--surface-sunken)] p-3.5">
                    <span className="text-xs font-bold text-[var(--ink-900)]">Exact Correct Answer</span>
                    <input
                      type="text"
                      placeholder="e.g. variable, function, True"
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-card)] px-3 py-2 text-xs text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Student response will be matched case-insensitively against this exact answer.
                    </p>
                  </div>
                )}

                {/* Code Execution Body */}
                {q.type === 'code_execution' && (
                  <div className="space-y-3 rounded-xl bg-[var(--surface-sunken)] p-3.5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Select
                        label="Language"
                        value={q.language || 'javascript'}
                        onChange={(e) => updateQuestion(idx, { language: e.target.value })}
                        options={CODE_LANGUAGES}
                      />
                      <Input
                        label="Expected Stdout / Output Match"
                        placeholder="e.g. Hello, World!"
                        value={q.expectedOutput || ''}
                        onChange={(e) => updateQuestion(idx, { expectedOutput: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[var(--ink-900)]">Starter Code for Learner</span>
                      <textarea
                        rows={4}
                        placeholder="// Write initial function template or snippet..."
                        value={q.starterCode || ''}
                        onChange={(e) => updateQuestion(idx, { starterCode: e.target.value })}
                        className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-slate-900 p-3 font-mono text-xs text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Feedback Explanation (Optional - displayed after question completion)
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Remember that arrays are zero-indexed."
                    value={q.explanation || ''}
                    onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-page)] px-3 py-1.5 text-xs text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
