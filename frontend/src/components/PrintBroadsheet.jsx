import { useReader } from "@/context/ReaderContext";
import { BionicText } from "@/components/BionicText";
import { countWords, readingTimeMinutes } from "@/lib/bionic";

export default function PrintBroadsheet() {
  const { text, sourceLabel, fixation } = useReader();
  if (!text) return null;
  const wc = countWords(text);
  const rt = readingTimeMinutes(text);
  const date = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div id="print-broadsheet" className="print-only" aria-hidden data-testid="print-broadsheet">
      <header className="pb-header">
        <div className="pb-row">
          <span>Vol. I · No. 1</span>
          <span>Bionic Reading Edition</span>
          <span>{date}</span>
        </div>
        <h1 className="pb-masthead">FocusRead</h1>
        <div className="pb-row pb-row-bottom">
          <span>The Reader's Daily</span>
          <span>{wc} words · {rt} min read</span>
          <span>Late Edition</span>
        </div>
      </header>

      {sourceLabel && (
        <>
          <div className="pb-kicker">Front Page · Bionic Edit</div>
          <h2 className="pb-title">{sourceLabel}</h2>
          <div className="pb-halftone" aria-hidden />
        </>
      )}

      <article className="pb-article">
        <BionicText text={text} fixation={fixation} />
      </article>

      <footer className="pb-footer">
        <span>— Printed with FocusRead —</span>
      </footer>
    </div>
  );
}
