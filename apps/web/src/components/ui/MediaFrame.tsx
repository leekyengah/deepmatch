import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type MediaRatio = "portrait" | "landscape" | "video";

const ratioClass: Record<MediaRatio, string> = {
  portrait: "dm-media-portrait",
  landscape: "dm-media-landscape",
  video: "dm-media-video",
};

/**
 * Fixed-aspect media well. Children should fill (e.g. next/image fill + object-cover).
 * Prefer portrait (3:4) for profile photos.
 */
export function MediaFrame({
  children,
  ratio = "portrait",
  className,
}: {
  children: ReactNode;
  ratio?: MediaRatio;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full bg-dm-line/40", ratioClass[ratio], className)}>
      {children}
    </div>
  );
}
