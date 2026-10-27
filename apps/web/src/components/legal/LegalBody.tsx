import type { LegalBlock } from "@deepmatch/legal-content";

export function LegalBody({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-dm-ink/90">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return <p key={i}>{block.text}</p>;
        }
        if (block.type === "h2") {
          return (
            <h2
              key={block.id}
              id={block.id}
              className="scroll-mt-24 pt-4 font-display text-2xl text-dm-raspberry"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={block.id}
              id={block.id}
              className="scroll-mt-24 pt-2 text-base font-semibold text-dm-deep"
            >
              {block.text}
            </h3>
          );
        }
        return (
          <ul key={i} className="list-disc space-y-2 pl-5">
            {block.items.map((item) => (
              <li key={item.slice(0, 48)}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
