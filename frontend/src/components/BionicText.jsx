import { memo } from "react";
import { bionicize } from "@/lib/bionic";

function Word({ token }) {
  return (
    <span className="whitespace-pre-wrap">
      {token.pre}
      <b className="bionic-b">{token.bold}</b>
      <span className="bionic-r">{token.rest}</span>
      {token.post}
    </span>
  );
}

function BionicTextComponent({ text, fixation }) {
  const paragraphs = bionicize(text, fixation);
  if (!paragraphs.length) return null;

  return (
    <>
      {paragraphs.map((tokens, pi) => (
        <p key={pi} className="mb-6 last:mb-0">
          {tokens.map((t, i) => {
            if (t.type === "space") return <span key={i}>{t.value}</span>;
            if (t.type === "break") return <br key={i} />;
            return <Word key={i} token={t} />;
          })}
        </p>
      ))}
    </>
  );
}

export const BionicText = memo(BionicTextComponent);
