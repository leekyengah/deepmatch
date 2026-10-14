import type { ReactNode } from "react";
import { cn } from "./cn";
import { Button } from "./Button";

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Retry",
  action,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-dm-lg border border-[#f0c9d4] bg-[#fff7f9] px-6 py-8",
        className,
      )}
    >
      <h2 className="font-display text-xl text-dm-raspberry">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-dm-muted">{description}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {onRetry ? (
          <Button type="button" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
