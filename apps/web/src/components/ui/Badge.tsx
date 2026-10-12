import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type Tone = "default" | "good" | "warn";

const tones: Record<Tone, string> = {
  default: "bg-dm-blush text-dm-primary",
  good: "bg-[#e4f0e8] text-[#2f7d4a]",
  warn: "bg-[#f7efe3] text-[#96734b]",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
