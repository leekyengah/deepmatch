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
  priority?: boolean;
}) {
  const isSymbol = variant === "symbol";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand SVG from /public
    <img
      src={srcs[variant]}
      alt="DeepMatch"
      width={isSymbol ? 40 : 160}
      height={isSymbol ? 40 : 53}
      decoding="async"
      className={cn(
        "h-auto w-auto object-contain",
        isSymbol ? "h-9 w-9" : "h-8 w-auto",
        className,
      )}
    />
  );
}
