import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-dm-lg border border-dm-line bg-dm-panel p-5 shadow-dm",
        className,
      )}
      {...props}
    />
  );
}
