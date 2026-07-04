import AppHeader from "@/components/AppHeader";
import InputPanel from "@/components/InputPanel";
import ControlPanel from "@/components/ControlPanel";
import BionicReader from "@/components/BionicReader";
import PrintBroadsheet from "@/components/PrintBroadsheet";
import { Toaster } from "@/components/ui/sonner";
import { useReader } from "@/context/ReaderContext";

export default function ReaderPage() {
  const { theme } = useReader();
  const isNews = theme === "newspaper";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="max-w-[1400px] mx-auto px-6 py-8 md:py-12">
        {/* Hero */}
        <section data-testid="hero" className="mb-10 md:mb-16 max-w-[70ch]">
          {isNews ? (
            <>
              <div className="label-caps mb-4">Editorial · Bionic Reading Engine</div>
              <h1 className="news-serif text-4xl sm:text-5xl lg:text-6xl leading-tight font-bold">
                All the words that’s fit to <em className="italic">read faster</em>.
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-[54ch] leading-relaxed news-serif">
                A modern printing press for your eyes. Drop pictures, PDFs, URLs or plain text — everything is
                type-set with fixation anchors that guide your gaze word by word.
              </p>
            </>
          ) : (
            <>
              <div className="label-caps mb-4">A focus tool for readers</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-light" style={{ fontFamily: "var(--font-serif)" }}>
                <b className="bionic-b">Turn</b> <span className="bionic-r">any</span>{" "}
                <b className="bionic-b">source</b> <span className="bionic-r">into</span>{" "}
                <b className="bionic-b">bion</b><span className="bionic-r">ic</span>{" "}
                <b className="bionic-b">text</b><span className="bionic-r">.</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-[54ch] leading-relaxed">
                Paste words, drop a PDF, upload a photo, or point at a URL — FocusRead adds fixation anchors to
                each word so your eye reads faster and your mind wanders less.
              </p>
            </>
          )}
        </section>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start" id="workspace">
          <div className="flex flex-col gap-6">
            <InputPanel />
            <div id="reader">
              <BionicReader />
            </div>
          </div>
          <ControlPanel />
        </div>

        <footer className={`mt-16 pt-6 flex items-center justify-between text-xs text-muted-foreground ${isNews ? "rule-thick" : "border-t border-border"}`}>
          <span className="font-mono">FocusRead · minimal bionic reading engine</span>
          <span className="label-caps opacity-60">v1 · 2026</span>
        </footer>
      </main>

      <Toaster theme="system" position="bottom-right" toastOptions={{ className: "rounded-none border border-border font-mono text-xs" }} />
      <PrintBroadsheet />
    </div>
  );
}
