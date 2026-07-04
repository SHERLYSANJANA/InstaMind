import { useReader } from "@/context/ReaderContext";

export default function AppHeader() {
  const { text } = useReader();

  return (
    <header
      data-testid="app-header"
      className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="h-7 w-7 border border-foreground flex items-center justify-center"
            aria-hidden
          >
            <span className="text-[10px] font-bold tracking-[0.08em]" style={{ fontFamily: 'var(--font-mono)' }}>FR</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-lg font-medium tracking-tight"
              style={{ fontFamily: 'var(--font-ui)' }}
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
    </header>
  );
}
