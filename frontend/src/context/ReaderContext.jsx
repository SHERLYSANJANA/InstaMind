import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ReaderContext = createContext(null);

export const THEMES = ["light", "dark", "newspaper"];
export const FIXATIONS = ["light", "normal", "strong"];

export const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "nld", label: "Dutch" },
  { code: "rus", label: "Russian" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
];

const DEFAULTS = {
  text: "",
  sourceLabel: "",
  fixation: "normal",
  fontFamily: "serif",
  fontSize: 20,
  lineHeight: 1.75,
  readingWidth: 68,
  theme: "light",
  ocrLang: "eng",
};

const MAX_PERSISTED_TEXT = 250_000; // ~250 KB

function loadState() {
  try {
    const raw = localStorage.getItem("focusread:state");
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function ReaderProvider({ children }) {
  const [state, setState] = useState(loadState);

  // Persist everything (including text) with a size guard.
  useEffect(() => {
    try {
      const persistable = { ...state };
      if (persistable.text && persistable.text.length > MAX_PERSISTED_TEXT) {
        persistable.text = "";
        persistable.sourceLabel = "";
      }
      localStorage.setItem("focusread:state", JSON.stringify(persistable));
    } catch { /* noop */ }
  }, [state]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "newspaper");
    if (state.theme === "dark") root.classList.add("dark");
    else if (state.theme === "newspaper") root.classList.add("newspaper");
  }, [state.theme]);

  // Keyboard shortcuts: t = cycle theme, [ / ] = cycle fixation
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "t" || e.key === "T") {
        setState((s) => {
          const idx = THEMES.indexOf(s.theme);
          return { ...s, theme: THEMES[(idx + 1) % THEMES.length] };
        });
        e.preventDefault();
      } else if (e.key === "[") {
        setState((s) => {
          const idx = FIXATIONS.indexOf(s.fixation);
          return { ...s, fixation: FIXATIONS[Math.max(0, idx - 1)] };
        });
        e.preventDefault();
      } else if (e.key === "]") {
        setState((s) => {
          const idx = FIXATIONS.indexOf(s.fixation);
          return { ...s, fixation: FIXATIONS[Math.min(FIXATIONS.length - 1, idx + 1)] };
        });
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      set: (patch) => setState((s) => ({ ...s, ...patch })),
      reset: () => setState({ ...DEFAULTS, text: state.text, sourceLabel: state.sourceLabel }),
      clearText: () => setState((s) => ({ ...s, text: "", sourceLabel: "" })),
    }),
    [state]
  );

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}

export function useReader() {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error("useReader must be used inside ReaderProvider");
  return ctx;
}
