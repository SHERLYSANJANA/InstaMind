// Bionic text conversion utilities.
// Strategy: for each word, bold the first N letters where N is derived from
// word length and a user-defined fixation strength (light | normal | strong).

const RATIOS = {
  light: 0.35,
  normal: 0.5,
  strong: 0.65,
};

// Minimum letters to bold for short words per strength
const MIN_BOLD = {
  light: 1,
  normal: 1,
  strong: 2,
};

export const FIXATION_LEVELS = ["light", "normal", "strong"];

function computeBoldLen(wordLen, strength) {
  const ratio = RATIOS[strength] ?? RATIOS.normal;
  const min = MIN_BOLD[strength] ?? 1;
  if (wordLen <= 1) return 1;
  if (wordLen <= 3) return Math.max(min, 1);
  const n = Math.ceil(wordLen * ratio);
  return Math.min(wordLen - 1, Math.max(min, n));
}

// Split a word into leading punctuation, letters, trailing punctuation.
const WORD_RE = /^([^\p{L}\p{N}]*)([\p{L}\p{N}'’-]*)([^\p{L}\p{N}]*)$/u;

/**
 * Convert a plain text string into an array of paragraph tokens, where each
 * paragraph is an array of tokens { type: 'word' | 'space', bold?, rest? }.
 * We return structured data so React can render safely (no dangerouslySetInnerHTML).
 */
export function bionicize(text, strength = "normal") {
  if (!text) return [];
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n\s*\n+/); // blank line = paragraph break
  return paragraphs.map((para) => {
    // Preserve single newlines as soft breaks within a paragraph
    const lines = para.split(/\n/);
    const tokens = [];
    lines.forEach((line, li) => {
      const parts = line.split(/(\s+)/); // keep whitespace tokens
      parts.forEach((chunk) => {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) {
          tokens.push({ type: "space", value: chunk });
          return;
        }
        const m = chunk.match(WORD_RE);
        if (!m) {
          tokens.push({ type: "word", pre: "", bold: chunk, rest: "", post: "" });
          return;
        }
        const [, pre, core, post] = m;
        if (!core) {
          tokens.push({ type: "word", pre, bold: "", rest: "", post });
          return;
        }
        const n = computeBoldLen(core.length, strength);
        tokens.push({
          type: "word",
          pre,
          bold: core.slice(0, n),
          rest: core.slice(n),
          post,
        });
      });
      if (li < lines.length - 1) {
        tokens.push({ type: "break" });
      }
    });
    return tokens;
  });
}

export function countWords(text) {
  if (!text) return 0;
  return (text.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
}

export function readingTimeMinutes(text, wpm = 240) {
  const words = countWords(text);
  return Math.max(1, Math.round(words / wpm));
}
