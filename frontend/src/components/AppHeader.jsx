import { useReader } from "@/context/ReaderContext";

export default function AppHeader() {
  const { text, theme } = useReader();
  const isNews = theme === "newspaper";

  return (
    <header
      data-testid="app-header"
      className={`border-b border-border sticky top-0 z-30 ${
        isNews
          ? "bg-[hsl(var(--background))] rule-thick"
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      {isNews ? (
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] font-semibold border-b border-foreground pb-2 mb-3">
            <span data-testid="news-nameplate-left">Vol. I · No. 1</span>
            <span>Bionic Reading Edition</span>
            <span>Weekdays · $0.00</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="masthead text-5xl md:text-6xl lg:text-7xl leading-none" data-testid="app-name">
              FocusRead
            </span>
            <a
              href="#reader"
              data-testid="header-jump-reader"
              className="label-caps hover:text-foreground transition-colors"
            >
              {text ? "Jump to article ↓" : "Awaiting copy"}
            </a>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] font-semibold border-t border-foreground pt-2">
            <span>The Reader's Daily</span>
            <span className="halftone-strip w-24 h-2" aria-hidden />
            <span>Late Edition</span>
          </div>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 border border-foreground flex items-center justify-center" aria-hidden>
              <span className="text-[10px] font-bold tracking-[0.08em]" style={{ fontFamily: "var(--font-mono)" }}>FR</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className="text-lg font-medium tracking-tight"
                style={{ fontFamily: "var(--font-ui)" }}
                data-testid="app-name"
              >
                <b className="bionic-b">Focu</b><span className="bionic-r">sRead</span>
              </span>
              <span className="hidden sm:inline label-caps opacity-60">Bionic Reader · v1</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="#reader"
              className="label-caps hover:text-foreground transition-colors"
              data-testid="header-jump-reader"
            >
              {text ? "Jump to reader ↓" : "Ready when you are"}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
