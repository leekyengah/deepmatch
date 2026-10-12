import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type Tone = "default" | "good" | "warn";

const tones: Record<Tone, string> = {
  default: "bg-[#FFF0F5] text-[#A63A63]",
  good: "bg-[#e4f7ef] text-[#18755b]",
  warn: "bg-[#fff6d9] text-[#906619]",
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
