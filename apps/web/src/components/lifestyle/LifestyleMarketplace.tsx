import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  LIFESTYLE_COMMERCIAL,
  LIFESTYLE_COUPLE_LINKS,
  LIFESTYLE_UTILITIES,
} from "@/lib/lifestyle-ia";
import { LOVE_PLACES } from "@/lib/love-places";
import { Button } from "@/components/ui/Button";

export type FeaturedProduct = {
  mockId: string;
  category: string;
  title: string;
  priceVnd: number;
  unit: string;
  providerName: string | null;
};

export type PartnerCard = {
  name: string;
  status: string;
  note: string | null;
};

export function LifestyleMarketplace({
  featured,
  partners,
  searchQuery,
  t,
}: {
  featured: FeaturedProduct[];
  partners: PartnerCard[];
  searchQuery: string | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const mapPreview = LOVE_PLACES.filter((p) => p.city === "Hà Nội").slice(0, 4);
  const q = (searchQuery ?? "").trim().toLowerCase();
  const filteredCommercial = q
    ? {
        ...LIFESTYLE_COMMERCIAL,
        items: LIFESTYLE_COMMERCIAL.items.filter(
          (i) =>
            (i.title ?? "").toLowerCase().includes(q) ||
            t(i.titleKey).toLowerCase().includes(q) ||
            t(i.descKey).toLowerCase().includes(q),
        ),
      }
    : LIFESTYLE_COMMERCIAL;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-10 pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(36,26,28,0.08)]">
        <div className="relative min-h-[240px] sm:min-h-[300px]">
          <Image
            src="/fixtures/home/hero-city.jpg"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#241A1C]/85 via-[#472025]/55 to-transparent" />
          <div className="relative grid min-h-[240px] gap-6 p-5 sm:min-h-[300px] sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-xl text-white">
              <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-white/75">
                {t("commerce.marketplaceEyebrow")}
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
                {t("commerce.marketplaceHeading")}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-[15px]">
                {t("commerce.marketplaceIntro")}
              </p>
              <form
                action="/lifestyle"
                method="get"
                className="mt-5 flex max-w-md overflow-hidden rounded-full bg-white/95 shadow-sm"
                role="search"
              >
                <label htmlFor="ls-q" className="sr-only">
                  {t("commerce.searchPlaceholder")}
                </label>
                <input
                  id="ls-q"
                  name="q"
                  defaultValue={searchQuery ?? ""}
                  placeholder={t("commerce.searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-dm-ink outline-none placeholder:text-dm-muted"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#6B2D3C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#54212f]"
                >
                  {t("commerce.searchCta")}
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/lifestyle/venue">
                  <Button type="button">{t("commerce.ctaExploreDates")}</Button>
                </Link>
                <Link
                  href="/places/map"
                  className="inline-flex items-center rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t("commerce.ctaOpenMap")}
                </Link>
              </div>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="relative h-48 w-40 overflow-hidden rounded-2xl border-[3px] border-white/80 shadow-lg">
                <Image
                  src="/fixtures/home/hero-portrait.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial categories */}
      <Section
        eyebrow={t(filteredCommercial.titleKey)}
        title={t("commerce.categoriesTitle")}
        hint={t(filteredCommercial.hintKey)}
      >
        {filteredCommercial.items.length === 0 ? (
          <p className="text-sm text-dm-muted">{t("commerce.searchEmpty")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filteredCommercial.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[18px] border border-dm-line bg-dm-panel p-4 shadow-dm transition hover:border-dm-primary"
              >
                <p className="font-display text-lg font-semibold text-dm-ink group-hover:text-dm-primary">
                  {item.title ?? t(item.titleKey)}
                </p>
                <p className="mt-1 text-xs leading-snug text-dm-muted">
                  {t(item.descKey)}
                </p>
                <span
                  aria-hidden
                  className="mt-4 inline-flex text-dm-champagne transition group-hover:text-dm-primary"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Featured services — live catalog rows */}
      <Section
        eyebrow={t("commerce.featuredEyebrow")}
        title={t("commerce.featuredTitle")}
        hint={t("commerce.featuredHint")}
        action={
          <Link
            href="/lifestyle/venue"
            className="text-sm font-semibold text-dm-primary"
          >
            {t("commerce.viewAll")}
          </Link>
        }
      >
        {!featured.length ? (
          <EmptyPanel
            title={t("commerce.categoryEmptyTitle")}
            body={t("commerce.categoryEmptyBody")}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <Link
                key={`${p.category}-${p.mockId}`}
                href={`/lifestyle/${p.category}/${p.mockId}`}
                className="group flex h-full flex-col rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm transition hover:border-dm-primary"
              >
                <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-dm-champagne">
                  {p.category}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-dm-ink group-hover:text-dm-primary">
                  {p.title}
                </h3>
                {p.providerName ? (
                  <p className="mt-1 text-xs text-dm-muted">{p.providerName}</p>
                ) : null}
                <p className="mt-auto pt-4 text-lg font-bold text-dm-primary">
                  {p.priceVnd.toLocaleString("vi-VN")}₫
                  <span className="ml-1 text-xs font-normal text-dm-muted">
                    / {p.unit}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Partners */}
      <Section
        eyebrow={t("commerce.partnersEyebrow")}
        title={t("commerce.partnersTitle")}
        hint={t("commerce.partnersHint")}
      >
        {!partners.length ? (
          <EmptyPanel
            title={t("commerce.partnersEmptyTitle")}
            body={t("commerce.partnersEmptyBody")}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((p) => (
              <div
                key={p.name}
                className="rounded-[18px] border border-dm-line bg-dm-panel p-4 shadow-dm"
              >
                <p className="font-display text-lg font-semibold text-dm-ink">
                  {p.name}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-dm-champagne">
                  {p.status}
                </p>
                {p.note ? (
                  <p className="mt-2 text-xs leading-snug text-dm-muted">
                    {p.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Couple experiences */}
      <Section
        eyebrow={t("commerce.coupleEyebrow")}
        title={t("commerce.coupleTitle")}
        hint={t("commerce.coupleHint")}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {LIFESTYLE_COUPLE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm transition hover:border-dm-primary"
            >
              <h3 className="font-display text-lg font-semibold text-dm-ink group-hover:text-dm-primary">
                {t(item.titleKey)}
              </h3>
              <p className="mt-2 text-sm text-dm-muted">{t(item.descKey)}</p>
              <span aria-hidden className="mt-4 inline-block text-dm-champagne">
                →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* AI Date Planner */}
      <section
        aria-labelledby="ai-planner-heading"
        className="overflow-hidden rounded-[22px] border border-dm-line bg-gradient-to-br from-[#FBF6F3] to-dm-panel p-5 shadow-dm sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
              {t("commerce.plannerEyebrow")}
            </p>
            <h2
              id="ai-planner-heading"
              className="mt-1 font-display text-2xl font-semibold text-dm-ink"
            >
              {t("commerce.plannerTitle")}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-dm-muted">
              {t("commerce.plannerBody")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/ai">
                <Button type="button">{t("commerce.plannerCta")}</Button>
              </Link>
              <Link
                href="/lifestyle/venue"
                className="inline-flex items-center text-sm font-semibold text-dm-primary"
              >
                {t("commerce.plannerSecondary")}
              </Link>
            </div>
          </div>
          <ul className="space-y-2">
            {["commerce.plannerStep1", "commerce.plannerStep2", "commerce.plannerStep3"].map(
              (key) => (
                <li
                  key={key}
                  className="rounded-xl border border-dm-line bg-white/70 px-4 py-3 text-sm text-dm-ink"
                >
                  {t(key)}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* Date Discovery Map */}
      <Section
        eyebrow={t("commerce.mapEyebrow")}
        title={t("commerce.mapTitle")}
        hint={t("commerce.mapHint")}
        action={
          <Link
            href="/places/map"
            className="text-sm font-semibold text-dm-primary"
          >
            {t("commerce.ctaOpenMap")}
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mapPreview.map((place) => (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="group rounded-[18px] border border-dm-line bg-dm-panel p-4 shadow-dm transition hover:border-dm-primary"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-dm-champagne">
                {place.district}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-dm-ink group-hover:text-dm-primary">
                {place.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-dm-muted">
                {place.blurb}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-dm-primary">
                  {place.priceHint}
                </span>
                {place.ratingMean != null ? (
                  <span className="text-dm-muted">
                    ★ {place.ratingMean.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Utilities */}
      <Section
        eyebrow={t(LIFESTYLE_UTILITIES.titleKey)}
        title={t("commerce.utilitiesTitle")}
        hint={t(LIFESTYLE_UTILITIES.hintKey)}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LIFESTYLE_UTILITIES.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-dm-line bg-dm-surface px-4 py-3 text-sm font-semibold text-dm-ink transition hover:border-dm-primary hover:text-dm-primary"
            >
              <span>{item.title ?? t(item.titleKey)}</span>
              <span aria-hidden className="text-dm-champagne">
                →
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  hint,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-dm-ink">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-dm-muted">{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-dm-line bg-[#FAF7F4] px-5 py-8 text-center">
      <p className="font-display text-lg font-semibold text-dm-ink">{title}</p>
      <p className="mt-2 text-sm text-dm-muted">{body}</p>
    </div>
  );
}
