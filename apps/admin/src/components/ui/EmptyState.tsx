import type { ReactNode } from "react";
import { cn } from "./cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-dm-lg border border-dashed border-dm-line bg-dm-panel/80 px-6 py-10 text-center",
        className,
      )}
    >
      <h2 className="font-display text-xl text-dm-raspberry">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-dm-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
