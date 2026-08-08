const { Button, Dialog, Badge } = window.SabiLearnDesignSystem_2075a4;

function AIToolDialog({ tool, onClose }) {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState(null);
  if (!tool) return null;
  const run = () => setResult(SAMPLE_OUTPUT[tool.key]);
  return (
    <Dialog open={!!tool} title={tool.title} onClose={onClose} footer={<Button size="sm" onClick={run}>{tool.cta}</Button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Badge tone="violet">AI-generated</Badge>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your notes or ask a question..."
          rows={4}
          style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", padding: "12px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--line)", resize: "none", outline: "none", boxSizing: "border-box" }}
        />
        {result && (
          <div style={{ background: "var(--brand-violet-100)", borderRadius: "var(--radius-md)", padding: "14px", fontSize: "var(--text-sm)", color: "var(--ink-900)", lineHeight: "var(--leading-relaxed)" }}>
            {result}
          </div>
        )}
      </div>
    </Dialog>
  );
}

const SAMPLE_OUTPUT = {
  summarizer: "Summary: Data normalization removes redundancy across tables; use 3NF for most transactional schemas.",
  quiz: "Q1. What does 3NF eliminate? A) Redundant data  B) Indexes  C) Foreign keys  D) Views",
  flashcards: "Card 1 — Front: 3NF · Back: Third Normal Form — no transitive dependencies.",
  qa: "Answer: 3NF requires the table to already be in 2NF, with no transitive dependency on the primary key.",
};

window.AIToolDialog = AIToolDialog;
