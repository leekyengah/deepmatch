"use client";

import { useT } from "@/components/i18n/I18nProvider";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";

type Gate = {
  discover_eligible: boolean;
  reasons: string[];
};

export function MediaGateClient() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    images: 0,
    videos: 0,
    approved_or_pending: 0,
  });
  const [gate, setGate] = useState<Gate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/media/library");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const json = (await res.json()) as {
      data?: {
        counts?: {
          images: number;
          videos: number;
          approved_or_pending: number;
        };
        gate?: Gate;
      };
    };
    setCounts(
      json.data?.counts ?? { images: 0, videos: 0, approved_or_pending: 0 },
    );
    setGate(json.data?.gate ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label={t("common.loading")} />;

  const reasonLabel: Record<string, string> = {
    need_min_3_images: t("profile.mediaGateNeedMin"),
    over_max_10_images: t("profile.mediaGateOverMax"),
    over_max_2_videos: t("profile.mediaGateOverVideos"),
  };

  return (
    <Card className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>
          {t("profile.mediaGateImages")}: {counts.images}
        </Badge>
        <Badge>
          {t("profile.mediaGateVideos")}: {counts.videos}
        </Badge>
        <Badge tone={gate?.discover_eligible ? "good" : "warn"}>
          {gate?.discover_eligible
            ? t("profile.mediaGateEligible")
            : t("profile.mediaGateBlocked")}
        </Badge>
      </div>
      <p className="text-dm-muted">{t("profile.mediaGateRule")}</p>
      {gate?.reasons?.length ? (
        <ul className="list-disc pl-5 text-dm-muted">
          {gate.reasons.map((r) => (
            <li key={r}>{reasonLabel[r] ?? r}</li>
          ))}
        </ul>
      ) : null}
      <Link href="/me/edit">
        <Button type="button" size="sm">
          {t("profile.mediaGateUploadCta")}
        </Button>
      </Link>
    </Card>
  );
}
