import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ReaderContext = createContext(null);

export const THEMES = ["light", "dark", "newspaper"];

const DEFAULTS = {
  text: "",
  sourceLabel: "",
  fixation: "normal",
  fontFamily: "serif",
  fontSize: 20,
  lineHeight: 1.75,
  readingWidth: 68,
  theme: "light",
};

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

  useEffect(() => {
    const { text, sourceLabel, ...prefs } = state;
    try {
      localStorage.setItem("focusread:state", JSON.stringify(prefs));
    } catch { /* noop */ }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "newspaper");
    if (state.theme === "dark") root.classList.add("dark");
    else if (state.theme === "newspaper") root.classList.add("newspaper");
  }, [state.theme]);

  const value = useMemo(
    () => ({
      ...state,
      set: (patch) => setState((s) => ({ ...s, ...patch })),
      reset: () => setState(DEFAULTS),
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
