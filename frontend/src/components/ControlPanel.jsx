import { useReader } from "@/context/ReaderContext";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Newspaper, RotateCcw, Sparkles } from "lucide-react";

const PRESETS = {
  default:    { label: "Default",              fontFamily: "serif",       fixation: "normal", fontSize: 20, lineHeight: 1.75, readingWidth: 68 },
  dyslexia:   { label: "Dyslexia-friendly",    fontFamily: "opendyslexic",fixation: "strong", fontSize: 22, lineHeight: 2.00, readingWidth: 55 },
  lowvision:  { label: "Low-vision",           fontFamily: "atkinson",    fixation: "strong", fontSize: 26, lineHeight: 1.90, readingWidth: 60 },
  adhd:       { label: "ADHD focus",           fontFamily: "lexend",      fixation: "strong", fontSize: 20, lineHeight: 1.85, readingWidth: 60 },
  speedread:  { label: "Speed read",           fontFamily: "lexend",      fixation: "strong", fontSize: 22, lineHeight: 1.60, readingWidth: 82 },
  editorial:  { label: "Editorial",            fontFamily: "georgia",     fixation: "normal", fontSize: 19, lineHeight: 1.80, readingWidth: 68 },
};

const FIXATION_OPTIONS = [
  { v: "light", l: "Light" },
  { v: "normal", l: "Normal" },
  { v: "strong", l: "Strong" },
];

const FONT_OPTIONS = [
  { v: "serif", l: "Default · Spectral" },
  { v: "sans", l: "IBM Plex · Sans" },
  { v: "mono", l: "JetBrains · Mono" },
  { v: "lexend", l: "Lexend" },
  { v: "atkinson", l: "Atkinson Hyperlegible" },
  { v: "opendyslexic", l: "OpenDyslexic" },
  { v: "comic", l: "Comic Sans" },
  { v: "verdana", l: "Verdana" },
  { v: "arial", l: "Arial" },
  { v: "georgia", l: "Georgia" },
];

const THEME_OPTIONS = [
  { v: "light", l: "Paper", Icon: Sun },
  { v: "dark", l: "Ink", Icon: Moon },
  { v: "newspaper", l: "News", Icon: Newspaper },
];

function Row({ label, children, testId }) {
  return (
    <div className="py-4 border-b border-border last:border-b-0" data-testid={testId}>
      <div className="label-caps mb-3">{label}</div>
      {children}
    </div>
  );
}

export default function ControlPanel() {
  const {
    fixation, fontFamily, fontSize, lineHeight, readingWidth, theme, set, reset,
  } = useReader();

  return (
    <aside
      data-testid="control-panel"
      className="bg-[hsl(var(--surface))] border border-border p-5 h-fit sticky top-6"
    >
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <div className="label-caps">Controls</div>
          <div className="text-xs text-muted-foreground font-mono mt-1">reader settings</div>
        </div>
      </div>

      {/* Preset */}
      <Row label="Reading preset" testId="control-preset">
        <Select
          onValueChange={(k) => {
            const p = PRESETS[k];
            if (p) set({
              fontFamily: p.fontFamily,
              fixation: p.fixation,
              fontSize: p.fontSize,
              lineHeight: p.lineHeight,
              readingWidth: p.readingWidth,
            });
          }}
        >
          <SelectTrigger data-testid="control-preset-trigger" className="rounded-none border-border h-10 font-mono text-xs">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <SelectValue placeholder="Apply a preset…" />
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {Object.entries(PRESETS).map(([k, p]) => (
              <SelectItem key={k} value={k} className="rounded-none font-mono text-xs" data-testid={`control-preset-${k}`}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      {/* Theme */}
      <Row label="Theme" testId="control-theme">
        <div className="grid grid-cols-3 gap-0 border border-border">
          {THEME_OPTIONS.map(({ v, l, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => set({ theme: v })}
              data-testid={`control-theme-${v}`}
              className={`text-[10px] uppercase tracking-[0.14em] font-semibold h-11 flex flex-col items-center justify-center gap-1 transition-colors border-r border-border last:border-r-0 ${
                theme === v
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground hover:bg-[hsl(var(--surface-secondary))]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {l}
            </button>
          ))}
        </div>
      </Row>

      {/* Fixation */}
      <Row label="Fixation" testId="control-fixation">
        <div className="grid grid-cols-3 gap-0 border border-border">
          {FIXATION_OPTIONS.map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => set({ fixation: v })}
              data-testid={`control-fixation-${v}`}
              className={`text-xs uppercase tracking-[0.1em] font-medium h-9 transition-colors border-r border-border last:border-r-0 ${
                fixation === v
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground hover:bg-[hsl(var(--surface-secondary))]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Row>

      {/* Font */}
      <Row label="Typeface" testId="control-font">
        <Select value={fontFamily} onValueChange={(v) => set({ fontFamily: v })}>
          <SelectTrigger data-testid="control-font-trigger" className="rounded-none border-border h-10 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {FONT_OPTIONS.map((o) => (
              <SelectItem
                key={o.v}
                value={o.v}
                className="rounded-none font-mono text-xs"
                data-testid={`control-font-${o.v}`}
              >
                <span
                  style={{
                    fontFamily:
                      o.v === "serif" ? "var(--font-serif)"
                      : o.v === "sans" ? "var(--font-sans)"
                      : o.v === "mono" ? "var(--font-mono)"
                      : o.v === "lexend" ? '"Lexend", sans-serif'
                      : o.v === "atkinson" ? '"Atkinson Hyperlegible", sans-serif'
                      : o.v === "opendyslexic" ? '"OpenDyslexic", "Comic Sans MS", cursive'
                      : o.v === "comic" ? '"Comic Sans MS", cursive'
                      : o.v === "verdana" ? "Verdana, sans-serif"
                      : o.v === "arial" ? "Arial, sans-serif"
                      : o.v === "georgia" ? "Georgia, serif"
                      : undefined,
                  }}
                >
                  {o.l}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      <Row label={`Size · ${fontSize}px`} testId="control-fontsize">
        <Slider value={[fontSize]} min={14} max={32} step={1} onValueChange={([v]) => set({ fontSize: v })} data-testid="control-fontsize-slider" />
      </Row>

      <Row label={`Line height · ${lineHeight.toFixed(2)}`} testId="control-lineheight">
        <Slider value={[Math.round(lineHeight * 100)]} min={130} max={220} step={5} onValueChange={([v]) => set({ lineHeight: v / 100 })} data-testid="control-lineheight-slider" />
      </Row>

      <Row label={`Width · ${readingWidth}ch`} testId="control-width">
        <Slider value={[readingWidth]} min={40} max={95} step={1} onValueChange={([v]) => set({ readingWidth: v })} data-testid="control-width-slider" />
      </Row>

      <button
        type="button"
        onClick={reset}
        data-testid="control-reset-btn"
        className="w-full mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.14em] font-medium h-9 border border-border hover:bg-[hsl(var(--surface-secondary))] transition-colors"
      >
        <RotateCcw className="h-3 w-3" />
        Reset defaults
      </button>
    </aside>
  );
}
