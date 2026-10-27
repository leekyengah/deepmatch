"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { useT } from "@/components/i18n/I18nProvider";

type Usage = {
  used: number;
  quota: number;
  remaining: number;
  circuitOpen: boolean;
  adapter: string;
};

export function AiUsageBadge() {
  const t = useT();
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    void fetch("/api/v1/ai/usage")
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok) {
          setUsage({
            used: j.used,
            quota: j.quota,
            remaining: j.remaining,
            circuitOpen: j.circuitOpen,
            adapter: j.adapter,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  if (!usage) return null;
  if (usage.circuitOpen) {
    return <Badge tone="warn">{t("ai.circuitOpen")}</Badge>;
  }
  return (
    <Badge tone={usage.remaining <= 5 ? "warn" : "good"}>
      {t("ai.quotaBadge", { used: usage.used, quota: usage.quota })}
    </Badge>
  );
}
