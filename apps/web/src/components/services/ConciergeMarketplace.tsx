"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import {
  COMPANION_PACKAGES,
  NEED_TAG_LABELS,
  formatVnd,
  type CompanionNeedTag,
  type CompanionPackage,
  type CompareLevel,
} from "@/lib/companion-packages";
import { Button } from "@/components/ui/Button";

type GroupFilter = "all" | "companion" | "matchmaking";

const COMPARE_ROWS: {
  key: keyof CompanionPackage["compare"];
  labelKey: string;
}[] = [
  { key: "duration", labelKey: "booking.compareDuration" },
  { key: "format", labelKey: "booking.compareFormat" },
  { key: "personalization", labelKey: "booking.comparePersonalization" },
  { key: "coordination", labelKey: "booking.compareCoordination" },
  { key: "dualSupport", labelKey: "booking.compareDualSupport" },
];

function Dot({ level }: { level: CompareLevel }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${level}/3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={
            i <= level
              ? "inline-block h-2 w-2 rounded-full bg-[#A88A62]"
              : "inline-block h-2 w-2 rounded-full bg-[#E8DFD6]"
          }
        />
      ))}
    </span>
  );
}

export function ConciergeMarketplace() {
  const t = useT();
  const [group, setGroup] = useState<GroupFilter>("all");
  const [need, setNeed] = useState<CompanionNeedTag | null>(null);

  const filtered = useMemo(() => {
    return COMPANION_PACKAGES.filter((p) => {
      if (group !== "all" && p.group !== group) return false;
      if (need && !p.needTags.includes(need)) return false;
      return true;
    });
  }, [group, need]);

  const companion = filtered.filter((p) => p.group === "companion");
  const matchmaking = filtered.filter((p) => p.group === "matchmaking");

  return (
    <div className="dm-page-frame dm-page-frame--wide space-y-14 pb-16">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {t("booking.conciergeEyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-dm-ink sm:text-4xl md:text-[2.75rem]">
            {t("booking.conciergeHeading")}
          </h1>
          <p className="mt-3 max-w-xl font-editorial text-sm leading-relaxed text-dm-muted sm:text-base">
            {t("booking.conciergeIntro")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#catalog">
              <Button type="button">{t("booking.ctaExplore")}</Button>
            </a>
            <Link href="/services/recommend">
              <Button type="button" variant="outline">
                {t("booking.ctaConsult")}
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[220px] overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(36,26,28,0.1)] sm:min-h-[280px]">
          <Image
            src="/fixtures/home/hero-city.jpg"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#241A1C]/65 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-editorial text-lg italic text-white sm:text-xl">
            {t("booking.heroQuote")}
          </p>
        </div>
      </section>

      {/* Trust bar — truthful claims only */}
      <section
        aria-label={t("booking.trustTitle")}
        className="grid gap-3 rounded-[18px] border border-dm-line bg-dm-panel p-4 shadow-dm sm:grid-cols-2 lg:grid-cols-4"
      >
        {(
          [
            ["booking.trustPrivacy", "booking.trustPrivacyBody"],
            ["booking.trustVerify", "booking.trustVerifyBody"],
            ["booking.trustSchedule", "booking.trustScheduleBody"],
            ["booking.trustSupport", "booking.trustSupportBody"],
          ] as const
        ).map(([title, body]) => (
          <div key={title} className="px-2 py-1">
            <p className="text-sm font-semibold text-dm-ink">{t(title)}</p>
            <p className="mt-1 text-xs leading-snug text-dm-muted">{t(body)}</p>
          </div>
        ))}
      </section>

      {/* Discovery */}
      <section id="catalog" aria-labelledby="discover-heading">
        <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
          {t("booking.discoverEyebrow")}
        </p>
        <h2
          id="discover-heading"
          className="mt-1 font-display text-2xl font-semibold text-dm-ink"
        >
          {t("booking.discoverTitle")}
        </h2>
        <p className="mt-2 text-sm text-dm-muted">{t("booking.discoverHint")}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["all", "booking.filterAll"],
              ["companion", "booking.groupCompanion"],
              ["matchmaking", "booking.groupMatchmaking"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGroup(id)}
              className={
                group === id
                  ? "rounded-full bg-[#6B2D3C] px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-dm-line px-4 py-2 text-sm font-semibold text-dm-muted hover:border-dm-primary hover:text-dm-primary"
              }
            >
              {t(label)}
            </button>
          ))}
          {(group !== "all" || need) && (
            <button
              type="button"
              onClick={() => {
                setGroup("all");
                setNeed(null);
              }}
              className="rounded-full px-3 py-2 text-sm font-semibold text-dm-primary underline"
            >
              {t("booking.filterReset")}
            </button>
          )}
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-dm-muted">
          {t("booking.needPrompt")}
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(NEED_TAG_LABELS) as CompanionNeedTag[]).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setNeed((n) => (n === tag ? null : tag))}
              className={
                need === tag
                  ? "shrink-0 rounded-full bg-[#F4E9E4] px-3 py-1.5 text-sm font-semibold text-[#6B2D3C]"
                  : "shrink-0 rounded-full border border-dm-line px-3 py-1.5 text-sm text-dm-muted"
              }
            >
              {NEED_TAG_LABELS[tag].vi}
            </button>
          ))}
        </div>

        {!filtered.length ? (
          <div className="mt-8 rounded-[18px] border border-dashed border-dm-line bg-[#FAF7F4] px-5 py-10 text-center">
            <p className="font-display text-lg font-semibold text-dm-ink">
              {t("booking.filterEmptyTitle")}
            </p>
            <p className="mt-2 text-sm text-dm-muted">
              {t("booking.filterEmptyBody")}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {companion.length > 0 ? (
              <PackageGrid
                title={t("booking.groupCompanion")}
                items={companion}
                t={t}
              />
            ) : null}
            {matchmaking.length > 0 ? (
              <PackageGrid
                title={t("booking.groupMatchmaking")}
                items={matchmaking}
                t={t}
              />
            ) : null}
          </div>
        )}
      </section>

      {/* Compare */}
      <section aria-labelledby="compare-heading">
        <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
          {t("booking.compareEyebrow")}
        </p>
        <h2
          id="compare-heading"
          className="mt-1 font-display text-2xl font-semibold text-dm-ink"
        >
          {t("booking.compareTitle")}
        </h2>
        <p className="mt-2 text-sm text-dm-muted">{t("booking.compareHint")}</p>
        <div className="dm-scroll-x mt-5 rounded-dm-xl border border-dm-line bg-dm-panel shadow-dm">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dm-line">
                <th className="px-4 py-3 font-semibold text-dm-muted">
                  {t("booking.compareFeature")}
                </th>
                {COMPANION_PACKAGES.map((p) => (
                  <th
                    key={p.code}
                    className="px-3 py-3 text-center text-xs font-bold text-dm-ink"
                  >
                    {p.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-dm-line/70">
                  <td className="px-4 py-3 text-dm-muted">{t(row.labelKey)}</td>
                  {COMPANION_PACKAGES.map((p) => (
                    <td key={p.code} className="px-3 py-3 text-center">
                      <Dot level={p.compare[row.key]} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 font-semibold text-dm-ink">
                  {t("booking.comparePrice")}
                </td>
                {COMPANION_PACKAGES.map((p) => (
                  <td
                    key={p.code}
                    className="px-2 py-3 text-center text-xs font-semibold text-dm-primary"
                  >
                    {formatVnd(p.salePriceVnd)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-dm-muted">{t("booking.compareLegend")}</p>
      </section>

      {/* Process */}
      <section aria-labelledby="process-heading">
        <h2
          id="process-heading"
          className="font-display text-2xl font-semibold text-dm-ink"
        >
          {t("booking.processTitle")}
        </h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <li
              key={n}
              className="rounded-[18px] border border-dm-line bg-dm-panel p-4 shadow-dm"
            >
              <p className="text-[11px] font-extrabold text-dm-champagne">
                0{n}
              </p>
              <p className="mt-2 text-sm font-semibold text-dm-ink">
                {t(`booking.processStep${n}`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Safety + FAQ + CTA */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold text-dm-ink">
            {t("booking.safetyTitle")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-dm-muted">
            <li>{t("booking.safety1")}</li>
            <li>{t("booking.safety2")}</li>
            <li>{t("booking.safety3")}</li>
            <li>{t("booking.safety4")}</li>
          </ul>
          <h3 className="mt-8 font-display text-xl font-semibold text-dm-ink">
            {t("booking.faqHeading")}
          </h3>
          <div className="mt-3 space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <details
                key={n}
                className="rounded-xl border border-dm-line bg-dm-panel px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-semibold text-dm-ink">
                  {t(`booking.faq${n}Q`)}
                </summary>
                <p className="mt-2 text-sm text-dm-muted">{t(`booking.faq${n}A`)}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-[22px] bg-[#6B2D3C] p-6 text-white shadow-dm sm:p-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-white/70">
              {t("booking.finalEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              {t("booking.finalTitle")}
            </h2>
            <p className="mt-3 text-sm text-white/85">{t("booking.finalBody")}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/services/recommend">
              <Button
                type="button"
                className="!bg-white !text-[#6B2D3C] hover:!bg-[#F7F3EE]"
              >
                {t("booking.ctaConsult")}
              </Button>
            </Link>
            <a href="#catalog">
              <Button
                type="button"
                variant="outline"
                className="!border-white/50 !text-white hover:!bg-white/10"
              >
                {t("booking.ctaExplore")}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <p className="text-center text-xs font-semibold uppercase tracking-[1.6px] text-dm-champagne">
        {t("booking.footerTagline")}
      </p>
    </div>
  );
}

function PackageGrid({
  title,
  items,
  t,
}: {
  title: string;
  items: CompanionPackage[];
  t: (k: string) => string;
}) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-dm-ink">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((s) => (
          <article
            key={s.code}
            className="flex h-full flex-col overflow-hidden rounded-[18px] border border-dm-line bg-dm-panel shadow-dm"
          >
            <div className="relative h-36 w-full">
              <Image
                src={s.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-lg font-semibold text-dm-ink">
                  {s.titleVi}
                </h4>
                <span className="shrink-0 rounded-full bg-[#F4E9E4] px-2 py-0.5 text-[10px] font-bold text-[#6B2D3C]">
                  {s.code}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-dm-muted">
                {s.suitableVi}
              </p>
              <p className="mt-3 text-lg font-bold text-dm-primary">
                {formatVnd(s.salePriceVnd)}
                <span className="ml-2 text-xs font-normal text-dm-muted line-through">
                  {formatVnd(s.listPriceVnd)}
                </span>
              </p>
              <p className="mt-1 text-xs text-dm-muted">{s.durationVi}</p>
              <div className="mt-4 grow" />
              <Link href={`/services/${s.slug}`} className="mt-2 block">
                <Button type="button" size="sm" className="w-full">
                  {t("booking.viewPackage")}
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
