import { cn } from "@/components/ui/cn";

type Variant = "full" | "symbol";

const srcs: Record<Variant, string> = {
  full: "/brand/deepmatch-logo.svg",
  symbol: "/brand/deepmatch-symbol.svg",
};

export function BrandLogo({
  variant = "full",
  className,
}: {
  variant?: Variant;
  className?: string;
  /** kept for call-site compatibility; SVG is static */
  priority?: boolean;
}) {
  const isSymbol = variant === "symbol";
  if (isSymbol) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- brand SVG from /public
      <img
        src={srcs.symbol}
        alt="DeepMatch"
        width={40}
        height={40}
        decoding="async"
        className={cn("h-10 w-10 object-contain", className)}
      />
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 text-dm-ink", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={srcs.symbol}
        alt=""
        width={28}
        height={28}
        decoding="async"
        className="h-7 w-7 object-contain"
      />
      <span className="font-display text-xl font-semibold tracking-tight">
        DeepMatch
      </span>
    </span>
  );
}
