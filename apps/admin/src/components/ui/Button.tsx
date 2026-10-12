import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-dm-primary text-white shadow-[0_5px_12px_#e9538320] hover:brightness-105",
  secondary: "bg-[#FFF0F5] text-dm-raspberry",
  outline: "border border-[#efcfda] bg-dm-panel text-dm-raspberry",
  ghost: "bg-transparent text-dm-raspberry",
  danger: "bg-dm-danger text-white",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-3 text-sm rounded-dm",
  sm: "px-3 py-2 text-xs rounded-[9px]",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
