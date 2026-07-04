import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ReaderContext = createContext(null);

const DEFAULTS = {
  text: "",
  sourceLabel: "",
  fixation: "normal",         // light | normal | strong
  fontFamily: "serif",         // serif | sans | mono
  fontSize: 20,                // px
  lineHeight: 1.75,
  readingWidth: 68,            // ch
  theme: "light",              // light | dark
};

function loadState() {
  try {
    const raw = localStorage.getItem("focusread:state");
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function ReaderProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    // Only persist prefs, not the text body
    const { text, sourceLabel, ...prefs } = state;
    try {
      localStorage.setItem("focusread:state", JSON.stringify(prefs));
    } catch {
      /* noop */
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
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
