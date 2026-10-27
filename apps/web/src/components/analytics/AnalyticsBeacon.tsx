"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires one allowlisted event on mount — no PII. */
export function AnalyticsBeacon({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    void track(event, props);
  }, [event, props]);
  return null;
}
