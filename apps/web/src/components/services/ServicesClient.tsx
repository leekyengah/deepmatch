"use client";

import { useT } from "@/components/i18n/I18nProvider";
import Link from "next/link";
import {
  COMPANION_PACKAGES,
  formatVnd,
} from "@/lib/companion-packages";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ServicesClient() {
  const t = useT();
  const companion = COMPANION_PACKAGES.filter((p) => p.group === "companion");
  const matchmaking = COMPANION_PACKAGES.filter(
    (p) => p.group === "matchmaking",
  );

  function Section({
    title,
    items,
  }: {
    title: string;
    items: typeof COMPANION_PACKAGES;
  }) {
    return (
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {title}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <Card key={s.code} className="flex h-full flex-col">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-dm-ink">{s.titleVi}</h3>
                <Badge>{s.code}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-dm-muted">
                {s.suitableVi}
              </p>
              <p className="mt-3 text-sm font-semibold text-dm-primary">
                {formatVnd(s.salePriceVnd)}
                <span className="ml-2 text-xs font-normal text-dm-muted line-through">
                  {formatVnd(s.listPriceVnd)}
                </span>
              </p>
              <p className="mt-1 text-xs text-dm-muted">{s.durationVi}</p>
              <div className="mt-4 grow" />
              <Link href={`/services/${s.slug}`}>
                <Button type="button" size="sm" className="w-full sm:w-auto">
                  {t("booking.viewPackage")}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <Section title={t("booking.groupCompanion")} items={companion} />
      <Section title={t("booking.groupMatchmaking")} items={matchmaking} />
    </div>
  );
}
