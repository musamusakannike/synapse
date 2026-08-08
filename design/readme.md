# SabiLearn Design System

SabiLearn is a Nigerian EdTech platform: users register and enroll in courses (free or paid), then study with built-in AI features — Summarizer, Quiz Generator, Flashcards Generator, and Q&A AI. This design system defines SabiLearn's visual language and a starter component/UI-kit set for prototyping and production.

## Sources
- **Attached codebase** (read-only, local folder mount, path prefix `components/`): a Next.js/Tailwind e-commerce + repair-services marketing site ("A1 Info Tech") — `Navbar.tsx`, `Hero.tsx`, `Features.tsx`, `Courses.tsx`, `CTA.tsx`, `Footer.tsx`, `WhoWeAre.tsx`, `Marquee.tsx`, `RepairServices.tsx`, `BookRepairModal.tsx`, `CartDrawer.tsx`, `Button.tsx`, and `Products/*`, `Gallery/*`, `Skeletons/*`. Per the brief, this was used **only for design ideas** (layout rhythm, card patterns, interaction style) — SabiLearn's own colors, type, and copy were built fresh from it, not copied 1:1.
- **Uploaded photography**: `uploads/lab-vials-purple.jpg`, `uploads/students-stairs.jpg`, `uploads/studying-laptop.jpg`, `uploads/vial-gloved-hand.jpg` — copied into `assets/images/`.
- No Figma file, logo, or brand guideline was provided.

## Design decision: which motif to carry forward
The source codebase contains **two competing visual languages**: (1) a dominant soft, rounded, shadow-elevated style used across `Navbar`, `Hero`, `Features`, `Courses`, `CTA`, `Footer`, `ProductCard`, `WhoWeAre` (rounded-lg/xl/2xl/3xl corners, `shadow-xs/md/xl`, dark-card-among-light-cards contrast), and (2) a brutalist hard-edge style (`border-2 border-black`, flat offset shadow, no radius) used only in `Button.tsx` and `RepairServices.tsx`. SabiLearn adopts motif (1) — the majority pattern — for consistency; the brutalist variant was not carried forward.

## Components
Built in `components/<group>/`, each with `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a `@dsCard`-tagged demo:
- **buttons/** — Button (primary/secondary/ghost/ai)
- **forms/** — Input, Select, Checkbox, Radio, Switch
- **feedback/** — Badge, ProgressBar, Toast
- **overlay/** — Tabs, Dialog
- **navigation/** — Navbar, Footer
- **cards/** — CourseCard, AIToolCard, StatCard

No formal component library existed in the source (only one ad-hoc `Button.tsx`), so this is a from-scratch set sized to SabiLearn's needs — no inventions beyond the standard primitives a learning platform needs (forms, feedback, overlay, nav, and three content cards specific to SabiLearn: course browsing, AI feature entry points, and dashboard stats).

## UI Kit
`ui_kits/platform/` — an interactive click-through of the SabiLearn web app: Login/Signup → Dashboard (stats, continue-learning rail, AI tools grid) → Course Catalog (filterable) → Course Detail (tabs, enroll) → AI tool dialogs (Summarizer, Quiz Generator, Flashcards Generator, Q&A AI) with sample output.

## Foundations
See `guidelines/` for specimen cards (Colors, Type, Spacing, Brand, Iconography) and the sections below.

## Index
- `styles.css` — root stylesheet, imports everything in `tokens/`
- `tokens/` — colors, typography, spacing, effects (radius/shadow/motion)
- `guidelines/` — specimen cards for the Design System tab
- `assets/images/` — uploaded photography
- `components/` — reusable primitives (see above)
- `ui_kits/platform/` — SabiLearn app click-through
- `thumbnail.html` — project tile
- `SKILL.md` — portable skill file for Claude Code

## Content fundamentals
- **Tone**: direct, encouraging, practical — like a sharp Nigerian tutor, not a corporate LMS. Short sentences, concrete verbs ("Enroll now", "Generate a quiz", "Build flashcards").
- **Voice**: second person ("you"), rarely first person. Headlines are declarative, not questions: "Learn faster, sabi more." not "Want to learn faster?"
- **"Sabi"**: Nigerian Pidgin for "to know/understand well" — used sparingly and only in the wordmark and one tagline ("Learn a skill. Sabi it for life."), never forced into every sentence.
- **Casing**: sentence case for body copy and buttons ("Enroll now", not "ENROLL NOW"); badges/tags are the one uppercase exception (e.g. "BESTSELLER"-style pills), matching the source's tag treatment.
- **Numbers**: prices always in Naira with the ₦ symbol and thousands separators (₦12,500), inherited directly from the source codebase's pricing display.
- **No emoji, ever.** No sparkle/✦ glyph either (the source used a "✦" bullet in its Marquee — SabiLearn replaces this with plain type or a Heroicons glyph). This was an explicit brand instruction.
- **AI feature copy** is always task-first, not hype-first: "Turn any lecture note into a short summary" rather than "Unlock the power of AI".

## Visual foundations
- **Color**: warm off-white surface (`--surface-page`) rather than clinical white/gray, near-black navy ink (`--ink-900`) for text and dark surfaces, gold (`--brand-gold`) as the primary action/pricing color, violet (`--brand-violet`) reserved exclusively for AI-feature surfaces (Summarizer, Quiz, Flashcards, Q&A) so AI tools are always visually distinguishable from plain course content. This departs intentionally from the source's coral/red (#FF634E/#E63946) — the brief explicitly allowed a different color choice.
- **Type**: Space Grotesk throughout (display and body) — per brand instruction. Headlines use tight tracking (`-0.02em`) and bold weight; body copy is regular weight at generous line-height (1.65) for long-form reading (course descriptions, AI output).
- **Spacing**: 4px base rhythm (4/8/12/16/20/24/32/40/48/64/80/96), same scale-of-doubling logic as the source's Tailwind spacing.
- **Backgrounds**: flat color fields and full-bleed photography only — no gradients except one soft dark scrim over hero/login imagery for text legibility (inherited from `Hero.tsx`/`WhoWeAre.tsx`'s image-overlay pattern). No illustrations, no repeating patterns/textures.
- **Animation**: subtle and functional only — 120–320ms ease-standard transitions on hover/press (color, translateY(-1px), width for progress bars). No bounce, no elaborate entrance animation, matching the source's restrained `transition-all duration-200`-style approach.
- **Hover states**: buttons darken (gold→gold-600, violet→violet-600) and lift 1px; cards raise their shadow tier; links shift to gold-600. No lightening-on-hover.
- **Press/active states**: no shrink or offset-shadow "press" effect (that was the brutalist Button.tsx motif, not carried forward) — SabiLearn keeps it to a simple hover state only.
- **Borders**: thin (1–1.5px) neutral-line borders (`--line`) on inputs and card outlines; borders thicken and darken on focus, never change color to a brand hue.
- **Shadows**: soft, layered, colorless (`rgba(14,14,26,…)`), four tiers (xs/sm/md/lg/xl) — no hard offset "brutalist" shadows.
- **Corner radii**: generous and consistent — 8px (sm controls) through 28px (feature cards), pills at full radius for badges/toggles. Directly inherited from the source's rounded-lg…rounded-3xl range.
- **Cards**: white or ink-900 fill, soft shadow, no border on marketing/content cards; a thin neutral border only on form-like cards (inputs, list items). The source's "one dark card among light cards" contrast pattern (`Features.tsx`, `Courses.tsx`) is reused for AIToolCard (violet) sitting among light CourseCards.
- **Transparency/blur**: none in this pass — the source used `backdrop-blur` on its sticky nav and video overlay; SabiLearn's app kit uses solid white nav bars instead for simplicity. Flag this if the user wants translucency reintroduced.
- **Imagery**: warm, natural daylight photography of students and study settings (per the uploaded assets) — no black-and-white treatment, no heavy grain.

## Iconography
No icon font or SVG sprite existed in the source (it used the `react-icons` npm package — Heroicons via `Hi*`, BoxIcons via `Bs*`, Feather via `Fi*` — none of which are files that could be copied). SabiLearn substitutes **Heroicons (outline, 1.8px stroke)** inline as hand-authored SVG matching that exact stroke weight and style, since it's the closest CDN-available match to the source's dominant `Hi*` usage. No emoji, no sparkle/star glyph anywhere — flagged explicitly per brand instruction. See `guidelines/iconography.html`.

## Fonts
Space Grotesk is loaded via Google Fonts CDN `@import` in `tokens/typography.css` (no local font files were available to copy). `--font-mono` points at "Space Mono" with a Space Grotesk fallback — no Space Mono file exists yet; upload one if you want true monospace figures for prices/timers.

## Intentional additions
- **Toast, Dialog, Tabs, Switch, Select, Radio** — not present in the source (which had no formal component library beyond `Button`), added as standard primitives an EdTech app needs (notifications, modals, course tabs, settings toggles, quiz answers, filters).
- **CourseCard, AIToolCard, StatCard** — SabiLearn-specific content cards not found in the source (which sold physical products, not courses); their layout borrows the source's `ProductCard`/`Courses.tsx` visual rhythm (image-top card, badge pill, price row) but the content model is original to SabiLearn.
