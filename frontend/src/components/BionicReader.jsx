import { useEffect, useMemo, useRef, useState } from "react";
import { useReader } from "@/context/ReaderContext";
import { BionicText } from "@/components/BionicText";
import { countWords, readingTimeMinutes } from "@/lib/bionic";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2, Keyboard, Play, Pause, Square, Ruler, Share2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ReadingProgress from "@/components/ReadingProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FONT_STACK = {
  serif: "var(--font-serif)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};

export default function BionicReader({ hideShare = false }) {
  const { text, sourceLabel, fixation, fontFamily, fontSize, lineHeight, readingWidth, theme, clearText } = useReader();
  const isNews = theme === "newspaper";
  const articleRef = useRef(null);
  const containerRef = useRef(null);

  const [rulerOn, setRulerOn] = useState(false);
  const [rulerY, setRulerY] = useState(null);

  // TTS state
  const [ttsState, setTtsState] = useState("idle"); // idle | speaking | paused
  const utterRef = useRef(null);

  const stats = useMemo(
    () => ({ words: countWords(text), minutes: readingTimeMinutes(text) }),
    [text]
  );

  const effectiveFontStack = isNews ? "var(--font-news)" : FONT_STACK[fontFamily];

  // Ruler mouse tracking
  useEffect(() => {
    if (!rulerOn || !containerRef.current) return;
    const el = containerRef.current;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y >= 0 && y <= rect.height) setRulerY(y);
      else setRulerY(null);
    };
    const onLeave = () => setRulerY(null);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [rulerOn]);

  // Stop TTS on unmount or text change
  useEffect(() => {
    return () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } };
  }, []);
  useEffect(() => {
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    setTtsState("idle");
  }, [text]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); toast.success("Text copied to clipboard"); }
    catch { toast.error("Copy failed"); }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "focusread-export.txt"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as .txt");
  };

  const handleShare = async () => {
    try {
      const res = await axios.post(`${API}/share`, {
        text,
        title: sourceLabel || null,
        source: sourceLabel || null,
      });
      const link = `${window.location.origin}/r/${res.data.id}`;
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not create share link");
    }
  };

  const handlePlay = () => {
    if (!window.speechSynthesis) { toast.error("Speech not supported in this browser"); return; }
    if (ttsState === "paused") { window.speechSynthesis.resume(); setTtsState("speaking"); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.onend = () => setTtsState("idle");
    u.onerror = () => setTtsState("idle");
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setTtsState("speaking");
  };
  const handlePause = () => { window.speechSynthesis?.pause(); setTtsState("paused"); };
  const handleStop = () => { window.speechSynthesis?.cancel(); setTtsState("idle"); };

  return (
    <section
      data-testid="bionic-reader"
      className={`relative flex-1 min-h-[70vh] border border-border ${isNews ? "newsprint-tex" : "bg-[hsl(var(--surface))]"}`}
    >
      {text && <ReadingProgress targetRef={articleRef} />}
      <header className={`flex flex-wrap gap-y-2 items-center justify-between border-b border-border px-6 py-3 ${isNews ? "rule-thick" : ""}`}>
        <div className="flex items-center gap-4 min-w-0">
          <span className="label-caps">{isNews ? "The Feature" : "Reader"}</span>
          {sourceLabel ? (
            <span data-testid="reader-source-label" className="text-xs text-muted-foreground font-mono truncate max-w-[40ch]">
              ← {sourceLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground font-mono mr-2">
            <span data-testid="reader-words">{stats.words} words</span>
            <span className="opacity-40">·</span>
            <span data-testid="reader-minutes">{stats.minutes} min</span>
          </div>

          {/* TTS group */}
          <div className="flex items-center border border-border">
            {ttsState !== "speaking" ? (
              <button type="button" onClick={handlePlay} disabled={!text} data-testid="reader-tts-play"
                className="h-8 px-2 text-xs flex items-center gap-1.5 hover:bg-[hsl(var(--surface-secondary))] disabled:opacity-40 border-r border-border">
                <Play className="h-3 w-3" />{ttsState === "paused" ? "Resume" : "Listen"}
              </button>
            ) : (
              <button type="button" onClick={handlePause} data-testid="reader-tts-pause"
                className="h-8 px-2 text-xs flex items-center gap-1.5 hover:bg-[hsl(var(--surface-secondary))] border-r border-border">
                <Pause className="h-3 w-3" />Pause
              </button>
            )}
            <button type="button" onClick={handleStop} disabled={ttsState === "idle"} data-testid="reader-tts-stop"
              className="h-8 px-2 text-xs flex items-center gap-1.5 hover:bg-[hsl(var(--surface-secondary))] disabled:opacity-40">
              <Square className="h-3 w-3" />
            </button>
          </div>

          {/* Ruler */}
          <button type="button" onClick={() => setRulerOn((v) => !v)} data-testid="reader-ruler-toggle"
            aria-pressed={rulerOn}
            className={`h-8 px-2 text-xs border border-border flex items-center gap-1.5 transition-colors ${rulerOn ? "bg-foreground text-background" : "hover:bg-[hsl(var(--surface-secondary))]"}`}>
            <Ruler className="h-3 w-3" />Ruler
          </button>

          {/* Shortcuts */}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" data-testid="reader-shortcuts-btn" aria-label="Keyboard shortcuts"
                  className="h-8 w-8 border border-border flex items-center justify-center hover:bg-[hsl(var(--surface-secondary))] transition-colors">
                  <Keyboard className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="rounded-none border-border font-mono text-[11px] leading-relaxed">
                <div className="uppercase tracking-widest label-caps mb-1">Shortcuts</div>
                <div><b>T</b> — cycle theme</div>
                <div><b>[</b> / <b>]</b> — fixation strength</div>
                <div><b>Space</b> — scroll page</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!hideShare && (
            <Button variant="ghost" size="sm" onClick={handleShare} disabled={!text} data-testid="reader-share-btn" className="rounded-none h-8">
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!text} data-testid="reader-copy-btn" className="rounded-none h-8">
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!text} data-testid="reader-download-btn" className="rounded-none h-8">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export
          </Button>
          {!hideShare && (
            <Button variant="ghost" size="sm" onClick={clearText} disabled={!text} data-testid="reader-clear-btn" className="rounded-none h-8">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
            </Button>
          )}
        </div>
      </header>

      <div ref={containerRef} className={`relative ${isNews ? "" : "paper-grain"}`}>
        {rulerOn && rulerY !== null && (
          <div
            data-testid="focus-ruler"
            className="pointer-events-none absolute left-0 right-0 z-10"
            style={{ top: `${rulerY}px` }}
            aria-hidden
          >
            <div className="h-6 -mt-3 bg-[hsl(var(--foreground)/0.08)] border-y border-foreground/40" />
          </div>
        )}
        {text ? (
          <div className={`mx-auto px-6 md:px-10 lg:px-14 py-10 md:py-14`} style={{ maxWidth: `${readingWidth}ch` }}>
            {isNews && sourceLabel && (
              <div className="mb-6 text-center">
                <div className="label-caps mb-2">Front Page · Bionic Edit</div>
                <h2 className="text-3xl md:text-4xl leading-tight news-serif font-bold" data-testid="news-article-title">
                  {sourceLabel}
                </h2>
                <div className="mt-3 mx-auto h-2 w-16 halftone-strip" aria-hidden />
              </div>
            )}
            <article
              ref={articleRef}
              data-testid="reader-article"
              style={{
                fontFamily: effectiveFontStack,
                fontSize: `${fontSize}px`,
                lineHeight,
                columnGap: isNews ? "2.5rem" : undefined,
                columnRule: isNews ? "1px solid hsl(var(--foreground) / 0.3)" : undefined,
              }}
              className={`text-foreground ${isNews ? "text-justify md:columns-2 [&_p]:break-inside-avoid" : ""}`}
            >
              <BionicText text={text} fixation={fixation} />
            </article>
          </div>
        ) : (
          <EmptyState isNews={isNews} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ isNews }) {
  if (isNews) {
    return (
      <div data-testid="reader-empty-state" className="min-h-[60vh] flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="label-caps mb-4">Extra Extra</div>
        <h2 className="masthead text-5xl md:text-7xl leading-none mb-6">Read All About It</h2>
        <div className="rule-thick w-40 my-2" />
        <p className="mt-6 text-sm text-muted-foreground max-w-[42ch] news-serif italic">
          Drop a photo, upload a PDF, paste text or a URL — every syllable set in the Reader's Daily bionic type.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <span className="halftone-strip h-2 w-16" aria-hidden />
          <span className="label-caps">Bionic Reading Engine</span>
          <span className="halftone-strip h-2 w-16" aria-hidden />
        </div>
      </div>
    );
  }
  return (
    <div data-testid="reader-empty-state" className="min-h-[60vh] flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="label-caps mb-6">Awaiting Input</div>
      <h2 className="text-3xl md:text-5xl tracking-tight font-light max-w-[24ch]" style={{ fontFamily: "var(--font-serif)" }}>
        <b className="bionic-b">Rea</b><span className="bionic-r">d</span>{" "}
        <b className="bionic-b">fas</b><span className="bionic-r">ter.</span>{" "}
        <b className="bionic-b">Foc</b><span className="bionic-r">us</span>{" "}
        <b className="bionic-b">dee</b><span className="bionic-r">per.</span>
      </h2>
      <p className="mt-8 text-sm text-muted-foreground max-w-[42ch]">
        Paste text, drop a PDF, upload an image or paste a URL — every word gets a fixation anchor for your eye to lock onto.
      </p>
      <div className="mt-10 flex items-center gap-3 label-caps text-[10px]">
        <span className="h-px w-8 bg-border" />
        <span>Bionic Reading Engine</span>
        <span className="h-px w-8 bg-border" />
      </div>
    </div>
  );
}
