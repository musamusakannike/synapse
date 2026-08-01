# SabiLearn Design System

## Context
SabiLearn is an AI-powered edtech platform for Nigerian students nationwide (sabilearn.online). Built from user testing, three features anchor the product:
- **Generate Quiz from uploaded documents** — turn notes/PDFs into practice quizzes.
- **Ready-made organized courses** — structured, guided learning paths.
- **Learn to code** — multiple programming languages.

No codebase, Figma file, or existing brand assets were attached for this project — this design system was built from scratch, from a written brief only. Reference points named by the founder: Duolingo (hooking/engagement mechanics — streaks, XP, gentle gamification) and Brilliant (clean, confident, editorial UI). No logo or mascot exists yet; none has been invented here (see Iconography).

**Sources:** none attached (brief-only). If a Figma file, repo, or brand assets exist, attach them via the Import menu and this system should be re-synced against them.

## Content fundamentals
- **Tone:** playful with light Nigerian flavor. "Sabi" is Nigerian Pidgin for "to know/skill" — lean into that in headlines and milestone copy without overusing pidgin in body text (keep instructional copy in clear standard English so it's unambiguous for a national audience).
- **Voice:** second-person, encouraging, big-sibling energy — not preachy, not corporate. Address the student directly ("you"), name their goal ("your WAEC prep", "your streak").
- **Casing:** sentence case everywhere — headlines, buttons, nav. No ALL CAPS except tiny eyebrow labels/tags.
- **Length:** short. One idea per line. Headlines ≤ 8 words. Never stack two sentences in a button.
- **Examples:**
  - Hero: "You sabi pass this exam." / "Turn any note into a quiz."
  - Empty state: "No courses yet — pick one and start today."
  - Streak nudge: "3 days running. Don't break it."
  - Quiz result: "8/10 — sharp! Two to review."
  - Error: "That upload didn't work. Try again?"
- **Emoji:** none in UI chrome (buttons, nav, system copy). A single celebratory emoji is acceptable in a milestone/toast moment (e.g. a streak completion), never decorative.
- **Numbers:** used sparingly and only when real (streak counts, scores, progress %) — never invented stats for flavor.

## Visual foundations
- **Color:** warm off-white page background, deep forest green as primary (trust, growth, "pass"), warm gold as the energy/reward accent (XP, streaks, celebration). Green and gold together read as a distinct, warm, African-market-adjacent palette rather than a generic ed-tech blue. Max two accent hues in any one screen; gold is reserved for progress/reward moments, not decoration.
- **Type:** Sora (display/headlines) — geometric, confident, a little friendly — paired with Karla (body/UI) for warmth and readability at small sizes. JetBrains Mono for the code-learning surfaces only. *Substitution flag: no brand font files were provided; Sora/Karla/JetBrains Mono are Google Fonts nearest-match picks for "clean, neutral, modern." Swap in real brand fonts if/when supplied.*
- **Spacing:** 4px base scale (4–128px). Generous whitespace between sections; one primary action per screen region — never crowd a card.
- **Backgrounds:** flat warm-neutral surfaces, no gradients as backgrounds. Full-bleed soft illustration panels on marketing/empty states only (see Iconography — placeholders pending real art). No repeating patterns/textures.
- **Illustration style:** soft, hand-drawn/sketch feel (loose linework, warm flat color fills) — think warm editorial sketches, not glossy 3D or flat corporate blob-people. *No illustration assets exist yet; this system uses labeled placeholder slots. Real illustrations should be commissioned or supplied to match this brief.*
- **Animation:** purposeful and light. Standard ease `cubic-bezier(.22,1,.36,1)` for UI transitions (200ms), a soft bounce ease for reward/celebration moments only (streak complete, correct answer, XP gain). No idle/ambient animation. No parallax.
- **Hover states:** primary buttons darken one step (`--color-primary-hover`); ghost/secondary buttons gain a soft tinted background; links underline on hover.
- **Press/active states:** darken one step further + scale to 0.97 (fast, 120ms) — a light tactile "press," never a shadow-only change.
- **Borders:** 1px, `--border-default`, used sparingly — most separation comes from spacing and surface-color contrast, not lines. Inputs and outline buttons use borders; cards mostly don't.
- **Shadows:** soft and shallow (`--shadow-sm/md/lg`) — ambient, low-opacity warm-black shadows, no hard drop shadows, no colored shadows.
- **Radii:** rounded but restrained — 8px small controls, 14px cards/inputs, 20–28px large panels/hero cards, full pill for tags/streak badges. Never sharp corners on interactive elements.
- **Cards:** white surface on the warm off-white page, `--radius-md` (14px), `--shadow-sm` at rest, `--shadow-md` on hover if interactive, no border by default.
- **Transparency/blur:** overlay scrims (`--surface-overlay`) behind modals/sheets only; no frosted-glass/backdrop-blur decoration elsewhere.
- **Imagery color vibe:** warm, sunlit, optimistic — not cool/corporate, not desaturated, no grain/duotone treatment.
- **Layout rules:** one primary CTA per screen; bottom tab bar fixed on mobile app surfaces; marketing site header sticky; never more than ~3 content chunks visible without scrolling — keep pages uncluttered per the founder's "not too much information on a page" brief.

## Iconography
No icon set, icon font, or SVG library was supplied. This system uses **Lucide** (CDN: `https://unpkg.com/lucide@latest`) as the icon set — open, MIT-licensed, matches the brand's clean-modern/rounded-stroke direction (1.75–2px stroke, rounded caps/joins). Flagged substitution: swap for a licensed/brand icon set if the company adopts one. No unicode-character icons. No emoji as icons. Illustrations are placeholder `<image-slot>` panels (drag-and-drop, user-fillable) — never hand-drawn SVG illustrations, since no reference art exists to copy faithfully. No logo exists; the wordmark "SabiLearn" is set in `--font-display` wherever a mark would go (see `assets/`).

## Components
Greenfield brief (no source inventory) — standard primitive set, grouped under `components/`:
- `forms/` — Button, IconButton, Input, Select, Checkbox, Radio, Switch
- `feedback/` — Badge, Tag, Toast, Tooltip, ProgressBar
- `overlays/` — Dialog
- `navigation/` — Tabs
- `learn/` — StreakBadge, XPPill, LessonCard, QuizOptionCard *(intentional additions — SabiLearn's Duolingo-style gamification needs primitives no generic kit provides; see below)*

**Intentional additions:** StreakBadge, XPPill, LessonCard, QuizOptionCard are not in a generic UI kit — added because the brief specifically calls for Duolingo-style hooking mechanics (streaks/XP) and quiz/course interactions core to the product.

## UI kits (`ui_kits/`)
- `marketing-site/` — landing page (hero, feature trio, course/quiz previews, footer)
- `quiz-generator/` — upload → generated quiz → results flow
- `courses/` — course catalog → course detail → lesson player
- `code-learning/` — language picker → coding lesson with editor + console

## Index
- `styles.css` — root stylesheet (import list)
- `tokens/` — colors, typography, spacing, effects, base resets
- `guidelines/` — foundation specimen cards (Design System tab)
- `components/` — reusable primitives (see above)
- `ui_kits/` — full product screens (see above)
- `assets/` — wordmark, placeholder illustration notes
- `SKILL.md` — portable skill file for Claude Code
