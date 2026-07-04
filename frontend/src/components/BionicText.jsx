import { memo } from "react";
import { bionicize } from "@/lib/bionic";

function Word({ token, isActive }) {
  return (
    <span
      className={`whitespace-pre-wrap transition-colors duration-100 ${
        isActive ? "bg-foreground/10 outline outline-1 outline-foreground/40" : ""
      }`}
      data-active={isActive ? "true" : undefined}
    >
      {token.pre}
      <b className="bionic-b">{token.bold}</b>
      <span className="bionic-r">{token.rest}</span>
      {token.post}
    </span>
  );
}

function BionicTextComponent({ text, fixation, activeStart = null }) {
  const paragraphs = bionicize(text, fixation);
  if (!paragraphs.length) return null;

  return (
    <>
      {paragraphs.map((tokens, pi) => (
        <p key={pi} className="mb-6 last:mb-0">
          {tokens.map((t, i) => {
            if (t.type === "space") return <span key={i}>{t.value}</span>;
            if (t.type === "break") return <br key={i} />;
            const isActive =
              activeStart !== null &&
              activeStart >= t.start &&
              activeStart < t.end;
            return <Word key={i} token={t} isActive={isActive} />;
          })}
        </p>
      ))}
    </>
  );
}

export const BionicText = memo(BionicTextComponent);
