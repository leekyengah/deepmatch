"use client";

import { useT } from "@/components/i18n/I18nProvider";
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "./cn";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const t = useT();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => prev?.focus();
  }, [open]);

  if (!open) return null;

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-dm-ink/35 p-4 pb-[max(1rem,var(--dm-safe-bottom))] sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "max-h-[min(85dvh,720px)] w-full max-w-dm-narrow overflow-y-auto rounded-dm-xl border border-dm-line bg-dm-panel p-5 shadow-dm outline-none",
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-xl text-dm-raspberry">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
