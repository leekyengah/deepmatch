import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full min-w-0 rounded-dm border border-[#EDD8E1] bg-dm-panel px-3.5 py-3 text-sm text-dm-ink outline-none focus:border-dm-primary",
        className,
      )}
      {...props}
    />
  );
}
