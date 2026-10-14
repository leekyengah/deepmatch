import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type PageFrameSize =
  | "app"
  | "wide"
  | "standard"
  | "narrow"
  | "prose"
  | "flush";

const sizeClass: Record<PageFrameSize, string> = {
  app: "dm-page-frame",
  wide: "dm-page-frame dm-page-frame--wide",
  standard: "dm-page-frame dm-page-frame--standard",
  narrow: "dm-page-frame dm-page-frame--narrow",
  prose: "dm-page-frame dm-page-frame--prose",
  flush: "dm-page-frame dm-page-frame--flush",
};

export function PageFrame({
  children,
  size = "app",
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  size?: PageFrameSize;
  className?: string;
  as?: "div" | "section" | "main" | "article";
}) {
  return <Tag className={cn(sizeClass[size], className)}>{children}</Tag>;
}
