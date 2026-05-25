"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const studyStyles = [
  { value: "textual", label: "Textual", description: "Detailed written explanations" },
  { value: "visual", label: "Visual", description: "Tables, diagrams, structured layouts" },
  { value: "analytical", label: "Analytical", description: "Logical steps, formulas, derivations" },
  { value: "case-study", label: "Case Study", description: "Real-world scenarios and examples" },
  { value: "qa", label: "Q&A Driven", description: "Question-answer format learning" },
];

const levels = [
  { value: "high school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgrad", label: "Postgraduate" },
  { value: "self-learner", label: "Self-learner" },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [style, setStyle] = useState(user?.style || "textual");
  const [level, setLevel] = useState(user?.level || "self-learner");
  const [goals, setGoals] = useState(user?.goals || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, style, level, goals }),
      });
      if (res.ok) {
        setSaved(true);
        await refreshUser();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
        Settings
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Customize your learning profile. This affects how the AI generates content for you.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Study Style */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3">
            Learning Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studyStyles.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`text-left p-4 rounded-xl border text-sm transition-all ${
                  style === s.value
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-secondary)]"
                }`}
              >
                <span className="font-medium block">{s.label}</span>
                <span className="text-xs text-[var(--text-muted)]">{s.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Education Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Learning Goals
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            placeholder="e.g. Preparing for medical school exams, focusing on biochemistry and anatomy..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
          {saved && (
            <span className="text-sm text-[var(--success)]">Saved successfully</span>
          )}
        </div>
      </form>
    </div>
  );
}
