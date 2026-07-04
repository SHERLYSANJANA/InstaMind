import { useMemo } from "react";
import { useReader } from "@/context/ReaderContext";
import { BionicText } from "@/components/BionicText";
import { countWords, readingTimeMinutes } from "@/lib/bionic";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FONT_STACK = {
  serif: "var(--font-serif)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};

export default function BionicReader() {
  const { text, sourceLabel, fixation, fontFamily, fontSize, lineHeight, readingWidth, theme, clearText } = useReader();
  const isNews = theme === "newspaper";

  const stats = useMemo(
    () => ({ words: countWords(text), minutes: readingTimeMinutes(text) }),
    [text]
  );

  // In newspaper mode, force news serif family for the reading surface regardless
  // of user's typeface pick (keeps the theme visually coherent). We still respect
  // size / line-height / width settings.
  const effectiveFontStack = isNews ? "var(--font-news)" : FONT_STACK[fontFamily];

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); toast.success("Text copied to clipboard"); }
    catch { toast.error("Copy failed"); }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focusread-export.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as .txt");
  };

  return (
    <section
      data-testid="bionic-reader"
      className={`relative flex-1 min-h-[70vh] border border-border ${isNews ? "newsprint-tex" : "bg-[hsl(var(--surface))]"}`}
    >
      <header className={`flex items-center justify-between border-b border-border px-6 py-3 ${isNews ? "rule-thick" : ""}`}>
        <div className="flex items-center gap-4">
          <span className="label-caps">{isNews ? "The Feature" : "Reader"}</span>
          {sourceLabel ? (
            <span data-testid="reader-source-label" className="text-xs text-muted-foreground font-mono truncate max-w-[40ch]">
              ← {sourceLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span data-testid="reader-words">{stats.words} words</span>
            <span className="opacity-40">·</span>
            <span data-testid="reader-minutes">{stats.minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!text} data-testid="reader-copy-btn" className="rounded-none h-8">
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!text} data-testid="reader-download-btn" className="rounded-none h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={clearText} disabled={!text} data-testid="reader-clear-btn" className="rounded-none h-8">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
            </Button>
          </div>
        </div>
      </header>

      <div className={`relative ${isNews ? "" : "paper-grain"}`}>
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
              data-testid="reader-article"
              style={{ fontFamily: effectiveFontStack, fontSize: `${fontSize}px`, lineHeight }}
              className={`text-foreground ${isNews ? "text-justify" : ""}`}
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
