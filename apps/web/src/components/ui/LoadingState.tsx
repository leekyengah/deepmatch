import { cn } from "./cn";

export function LoadingState({
  label = "…",
  className,
}: {
  /** Pass a localized label (e.g. t("common.loading")). */
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-3 text-sm text-dm-muted", className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-dm-blush border-t-dm-primary"
        aria-hidden
      />
      {label}
    </div>
  );
}
