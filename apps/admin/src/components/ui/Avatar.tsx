import { cn } from "./cn";

export function Avatar({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={cn(
        "inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#e890aa] to-[#9c3659] text-xs font-bold text-white",
        className,
      )}
      aria-hidden={false}
      aria-label={label}
    >
      {initials || "?"}
    </span>
  );
}
