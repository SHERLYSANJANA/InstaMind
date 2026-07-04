import { useReader } from "@/context/ReaderContext";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun, RotateCcw } from "lucide-react";

const FIXATION_OPTIONS = [
  { v: "light", l: "Light" },
  { v: "normal", l: "Normal" },
  { v: "strong", l: "Strong" },
];

const FONT_OPTIONS = [
  { v: "serif", l: "Spectral · Serif" },
  { v: "sans", l: "IBM Plex · Sans" },
  { v: "mono", l: "JetBrains · Mono" },
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
    fixation,
    fontFamily,
    fontSize,
    lineHeight,
    readingWidth,
    theme,
    set,
    reset,
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
        <Button
          size="icon"
          variant="ghost"
          onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })}
          data-testid="control-theme-toggle"
          aria-label="Toggle theme"
          className="rounded-none h-9 w-9 border border-border"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

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
          <SelectTrigger
            data-testid="control-font-trigger"
            className="rounded-none border-border h-10 font-mono text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {FONT_OPTIONS.map((o) => (
              <SelectItem key={o.v} value={o.v} className="rounded-none font-mono text-xs" data-testid={`control-font-${o.v}`}>
                {o.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      {/* Font size */}
      <Row label={`Size · ${fontSize}px`} testId="control-fontsize">
        <Slider
          value={[fontSize]}
          min={14}
          max={32}
          step={1}
          onValueChange={([v]) => set({ fontSize: v })}
          data-testid="control-fontsize-slider"
        />
      </Row>

      {/* Line height */}
      <Row label={`Line height · ${lineHeight.toFixed(2)}`} testId="control-lineheight">
        <Slider
          value={[Math.round(lineHeight * 100)]}
          min={130}
          max={220}
          step={5}
          onValueChange={([v]) => set({ lineHeight: v / 100 })}
          data-testid="control-lineheight-slider"
        />
      </Row>

      {/* Reading width */}
      <Row label={`Width · ${readingWidth}ch`} testId="control-width">
        <Slider
          value={[readingWidth]}
          min={40}
          max={95}
          step={1}
          onValueChange={([v]) => set({ readingWidth: v })}
          data-testid="control-width-slider"
        />
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
