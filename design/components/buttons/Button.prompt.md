Primary action button for enrolling, submitting and confirming — use `variant="ai"` only for actions that trigger an AI feature (Summarizer, Quiz generator, Flashcards, Q&A AI).

```jsx
<Button variant="primary" size="md">Enroll now</Button>
<Button variant="ai" icon={<SparkFreeIcon />}>Generate summary</Button>
```

Variants: `primary` (gold, main CTA), `secondary` (outlined, secondary action), `ghost` (text-only, low emphasis), `ai` (violet, AI-triggered actions). Sizes: `sm`, `md`, `lg`. Never place an emoji or sparkle glyph inside a Button icon slot — use a Heroicons-style outline icon instead.
