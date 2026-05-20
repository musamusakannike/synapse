import React from "react";
import { useFadeIn } from "./animations";

type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "identifier"
  | "punctuation"
  | "plain";

interface Token {
  type: TokenType;
  value: string;
}

const LANG_KEYWORDS: Record<string, string[]> = {
  javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "default", "async", "await", "new", "this", "typeof", "of", "in", "true", "false", "null", "undefined"],
  typescript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "default", "async", "await", "new", "this", "typeof", "of", "in", "true", "false", "null", "undefined", "interface", "type", "enum", "string", "number", "boolean"],
  python: ["def", "class", "return", "if", "elif", "else", "for", "while", "import", "from", "as", "with", "pass", "break", "continue", "lambda", "True", "False", "None", "and", "or", "not", "in", "is"],
  java: ["public", "private", "protected", "class", "interface", "enum", "return", "if", "else", "for", "while", "new", "this", "super", "import", "package", "static", "final", "void", "int", "String", "boolean", "true", "false", "null"],
};

function tokenize(code: string, language: string): Token[] {
  const lang = language.toLowerCase().replace(/^(js)$/, "javascript").replace(/^(ts)$/, "typescript");
  const kws = new Set(LANG_KEYWORDS[lang] ?? LANG_KEYWORDS["javascript"]);
  const tokens: Token[] = [];

  for (const line of code.split("\n")) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
      tokens.push({ type: "comment", value: line });
      tokens.push({ type: "plain", value: "\n" });
      continue;
    }

    const wordReg = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\d+\.?\d*|[A-Za-z_$][A-Za-z0-9_$]*|[^\w\s]|\s+)/g;
    let match: RegExpExecArray | null;
    while ((match = wordReg.exec(line)) !== null) {
      const val = match[0];
      if (/^\s+$/.test(val)) tokens.push({ type: "plain", value: val });
      else if (/^["'`]/.test(val)) tokens.push({ type: "string", value: val });
      else if (/^\d/.test(val)) tokens.push({ type: "number", value: val });
      else if (kws.has(val)) tokens.push({ type: "keyword", value: val });
      else if (/^[+\-*/%=<>!&|^~?:]+/.test(val)) tokens.push({ type: "operator", value: val });
      else if (/^[()[\]{},;.]/.test(val)) tokens.push({ type: "punctuation", value: val });
      else tokens.push({ type: "identifier", value: val });
    }
    tokens.push({ type: "plain", value: "\n" });
  }
  return tokens;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "#c792ea",
  string: "#c3e88d",
  number: "#f78c6c",
  comment: "#546e7a",
  operator: "#89ddff",
  identifier: "#e0e0e0",
  punctuation: "#89ddff",
  plain: "#e0e0e0",
};

interface CodeBlockProps {
  code: string;
  language?: string;
  delay?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "javascript", delay = 0 }) => {
  const opacity = useFadeIn(delay, delay + 20);
  const tokens = tokenize(code.trim(), language);

  return (
    <div
      style={{
        opacity,
        background: "rgba(15, 12, 41, 0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "24px 28px",
        fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize: 18,
        lineHeight: 1.7,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 16,
          fontSize: 11,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {language}
      </div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {tokens.map((token, i) => (
          <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
            {token.value}
          </span>
        ))}
      </pre>
    </div>
  );
};
