import { useEffect, useRef, useState } from "react";

/** Fills as the user scrolls a target element (or window) between its top and bottom edges. */
export default function ReadingProgress({ targetRef }) {
  const [pct, setPct] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const update = () => {
      const el = targetRef?.current;
      if (!el) { setPct(0); return; }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height - vh;
      if (total <= 0) {
        // Article fits in viewport
        setPct(rect.bottom <= vh ? 100 : 0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setPct(Math.round((scrolled / total) * 100));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetRef]);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-40 bg-transparent pointer-events-none"
      aria-hidden
    >
      <div
        data-testid="reading-progress"
        className="h-full bg-foreground transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
