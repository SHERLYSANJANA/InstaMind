// Bionic text conversion utilities with source char offsets for TTS sync.

const RATIOS = { light: 0.35, normal: 0.5, strong: 0.65 };
const MIN_BOLD = { light: 1, normal: 1, strong: 2 };

export const FIXATION_LEVELS = ["light", "normal", "strong"];

function computeBoldLen(wordLen, strength) {
  const ratio = RATIOS[strength] ?? RATIOS.normal;
  const min = MIN_BOLD[strength] ?? 1;
  if (wordLen <= 1) return 1;
  if (wordLen <= 3) return Math.max(min, 1);
  const n = Math.ceil(wordLen * ratio);
  return Math.min(wordLen - 1, Math.max(min, n));
}

const WORD_RE = /^([^\p{L}\p{N}]*)([\p{L}\p{N}'’-]*)([^\p{L}\p{N}]*)$/u;

/**
 * Tokenise text into paragraphs of tokens. Each word token carries the
 * character range { start, end } (relative to the whole input string) so
 * TTS boundary events can highlight the active word.
 */
export function bionicize(text, strength = "normal") {
  if (!text) return [];
  const normalised = text.replace(/\r\n/g, "\n");
  const paragraphSplitRe = /\n\s*\n+/g;

  const paragraphs = [];
  let cursor = 0;
  const parts = normalised.split(paragraphSplitRe);

  for (let pi = 0; pi < parts.length; pi++) {
    const para = parts[pi];
    const tokens = [];
    const lines = para.split(/\n/);
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      // Split on whitespace groups while keeping them
      const chunks = line.split(/(\s+)/);
      for (const chunk of chunks) {
        if (!chunk) continue;
        const start = cursor;
        cursor += chunk.length;
        const end = cursor;
        if (/^\s+$/.test(chunk)) {
          tokens.push({ type: "space", value: chunk, start, end });
          continue;
        }
        const m = chunk.match(WORD_RE);
        if (!m) {
          tokens.push({ type: "word", pre: "", bold: chunk, rest: "", post: "", start, end });
          continue;
        }
        const [, pre, core, post] = m;
        if (!core) {
          tokens.push({ type: "word", pre, bold: "", rest: "", post, start, end });
          continue;
        }
        const n = computeBoldLen(core.length, strength);
        tokens.push({
          type: "word",
          pre,
          bold: core.slice(0, n),
          rest: core.slice(n),
          post,
          start,
          end,
        });
      }
      if (li < lines.length - 1) {
        tokens.push({ type: "break", start: cursor, end: cursor + 1 });
        cursor += 1; // for the \n
      }
    }
    paragraphs.push(tokens);
    if (pi < parts.length - 1) {
      // account for the paragraph separator we split away (approx 2 chars)
      // find the actual length of the separator between this and next part
      const sepMatch = normalised.slice(cursor).match(/^\n\s*\n+/);
      cursor += sepMatch ? sepMatch[0].length : 2;
    }
  }
  return paragraphs;
}

export function countWords(text) {
  if (!text) return 0;
  return (text.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
}

export function readingTimeMinutes(text, wpm = 240) {
  const words = countWords(text);
  return Math.max(1, Math.round(words / wpm));
}
