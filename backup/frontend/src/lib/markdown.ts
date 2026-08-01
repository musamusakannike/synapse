import { marked } from "marked";
import katex from "katex";

/**
 * Parses markdown content and renders embedded mathematical equations (LaTeX) using KaTeX.
 * Supports:
 * - Block equations: \[ ... \] and $$ ... $$
 * - Inline equations: \( ... \) and $ ... $
 * 
 * To prevent Markdown syntax (like underscores, asterisks, and backslashes) from breaking
 * the LaTeX formatting, we temporarily extract all math blocks, compile the Markdown,
 * render the math with KaTeX, and then re-inject the rendered HTML.
 */
export function formatMarkdown(md: string): string {
  if (!md) return "";

  const blockMathBlocks: string[] = [];
  const inlineMathBlocks: string[] = [];

  // 1. Extract block math: \[ ... \]
  let processed = md.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const placeholder = `MATHBLOCKPLACEHOLDER${blockMathBlocks.length}`;
    blockMathBlocks.push(math.trim());
    return placeholder;
  });

  // 2. Extract block math: $$ ... $$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const placeholder = `MATHBLOCKPLACEHOLDER${blockMathBlocks.length}`;
    blockMathBlocks.push(math.trim());
    return placeholder;
  });

  // 3. Extract inline math: \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const placeholder = `MATHINLINEPLACEHOLDER${inlineMathBlocks.length}`;
    inlineMathBlocks.push(math.trim());
    return placeholder;
  });

  // 4. Extract inline math: $ ... $
  processed = processed.replace(/(?<!\$)\$(?!\s)([^$]+?)(?<!\s)\$(?!\$)/g, (_, math) => {
    const placeholder = `MATHINLINEPLACEHOLDER${inlineMathBlocks.length}`;
    inlineMathBlocks.push(math.trim());
    return placeholder;
  });

  // 5. Compile remaining markdown using marked
  let html = "";
  try {
    html = marked.parse(processed, { async: false }) as string;
  } catch {
    html = processed;
  }

  // Wrap standard markdown tables in responsive containers
  try {
    html = html.replaceAll("<table>", '<div class="table-wrapper"><table>')
               .replaceAll("</table>", "</table></div>");
  } catch (err) {
    console.error("Failed to wrap tables:", err);
  }

  // 6. Restore block math with KaTeX
  blockMathBlocks.forEach((math, index) => {
    const placeholder = `MATHBLOCKPLACEHOLDER${index}`;
    try {
      const rendered = katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
      });
      html = html.replaceAll(
        placeholder,
        `<div class="katex-display-wrapper my-6 py-2 overflow-x-auto w-full max-w-full scrollbar-thin">${rendered}</div>`
      );
    } catch {
      html = html.replaceAll(
        placeholder,
        `<pre class="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs overflow-x-auto">$$${math}$$</pre>`
      );
    }
  });

  // 7. Restore inline math with KaTeX
  inlineMathBlocks.forEach((math, index) => {
    const placeholder = `MATHINLINEPLACEHOLDER${index}`;
    try {
      const rendered = katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
      });
      html = html.replaceAll(placeholder, rendered);
    } catch {
      html = html.replaceAll(
        placeholder,
        `<code class="px-1.5 py-0.5 rounded bg-[var(--danger)]/10 text-[var(--danger)] text-xs">$${math}$</code>`
      );
    }
  });

  return html;
}
