import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ME_MANAGEMENT_GROUPS,
  ME_NEXT_ACTIONS,
} from "@/lib/me-fixtures";
import type { HomeState } from "@/lib/home-state";

export type MemberCenterProps = {
  displayName: string;
  location: string | null;
  headline: string | null;
  age: number | null;
  avatarUrl: string | null;
  stateLabel: string;
  discoveryOn: boolean;
  discoveryOnLabel: string;
  discoveryOffLabel: string;
  homeState: HomeState;
  primaryCtaLabel: string;
  primaryHref: string;
  completionPercent: number;
  hasEntitlement: boolean;
  membershipLabel: string;
  connectionsCount: number;
  upcomingDatesCount: number;
  matchesActive: number;
  journeyStep: number;
  journeyTotal: number;
  matchPreviewUrls: string[];
  isStaff: boolean;
  adminUrl: string;
  staffOpsLabel: string;
  staffAdminLabel: string;
  logoutSlot: ReactNode;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export function MemberCenter({
  displayName,
  location,
  headline,
  age,
  avatarUrl,
  stateLabel,
  discoveryOn,
  discoveryOnLabel,
  discoveryOffLabel,
  homeState,
  primaryCtaLabel,
  primaryHref,
  completionPercent,
  hasEntitlement,
  membershipLabel,
  connectionsCount,
  upcomingDatesCount,
  matchesActive,
  journeyStep,
  journeyTotal,
  matchPreviewUrls,
  isStaff,
  adminUrl,
  staffOpsLabel,
  staffAdminLabel,
  logoutSlot,
  t,
}: MemberCenterProps) {
  const pct = Math.min(100, Math.max(0, completionPercent));
  const showVerified = homeState === "matched" || homeState === "couple";
  const journeyPct =
    journeyTotal > 0
      ? Math.round((journeyStep / journeyTotal) * 100)
      : 0;
  const initials = displayName.trim().slice(0, 1).toUpperCase() || "Đ";

  return (
    <div className="dm-page-frame dm-page-frame--standard space-y-8 pb-10">
      <section
        aria-labelledby="member-identity-heading"
        className="relative overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(36,26,28,0.08)]"
      >
        <div className="relative min-h-[200px] sm:min-h-[240px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, #241A1C 0%, #472025 48%, #6B2D3C 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#241A1C]/82 via-[#472025]/55 to-[#241A1C]/25" />
          <div className="relative flex h-full min-h-[200px] flex-col justify-end gap-5 p-5 sm:min-h-[240px] sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="flex items-end gap-4">
              <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-[3px] border-white/90 shadow-lg sm:h-28 sm:w-28">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    priority
                    unoptimized
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center bg-[#6B2D3C] font-display text-3xl font-semibold text-white"
                    aria-hidden
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div className="min-w-0 text-white">
                <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-white/75">
                  {t("profile.memberCenter.identityEyebrow")}
                </p>
                <h1
                  id="member-identity-heading"
                  className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {displayName}
                </h1>
                <p className="mt-1 max-w-md font-editorial text-sm italic leading-relaxed text-white/90">
                  {headline?.trim() ||
                    t("profile.memberCenter.headlineFallback")}
                </p>
                <p className="mt-2 text-xs text-white/70">
                  {location?.trim() || t("profile.memberCenter.locationUnset")}
                  {typeof age === "number" ? (
                    <>
                      <span className="mx-1.5 opacity-50">·</span>
                      {t("profile.memberCenter.ageLabel", { age })}
                    </>
                  ) : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {showVerified ? (
                    <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      {t("profile.memberCenter.matchedBadge")}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-full bg-[#6B2D3C]/90 px-2.5 py-1 text-[11px] font-bold text-white">
                    {hasEntitlement
                      ? membershipLabel
                      : t("profile.memberCenter.tierExplorer")}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white/95 backdrop-blur-sm">
                    {stateLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden w-40 shrink-0 sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-white/70">
                {t("profile.memberCenter.completion")}
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-dm-champagne">
                {pct}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-dm-champagne"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="rel-dash-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
              {t("profile.memberCenter.dashboardEyebrow")}
            </p>
            <h2
              id="rel-dash-heading"
              className="mt-1 font-display text-2xl font-semibold text-dm-ink"
            >
              {t("profile.memberCenter.dashboardTitle")}
            </h2>
          </div>
          <Badge tone={discoveryOn ? "good" : "warn"}>
            {discoveryOn ? discoveryOnLabel : discoveryOffLabel}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashStat
            label={t("profile.memberCenter.statCompletion")}
            value={`${pct}%`}
            footer={
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F4E9E4]">
                <div
                  className="h-full rounded-full bg-[#6B2D3C]"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            }
          />
          <DashStat
            label={t("profile.memberCenter.statConnections")}
            value={String(connectionsCount)}
          />
          <DashStat
            label={t("profile.memberCenter.statDates")}
            value={String(upcomingDatesCount)}
            footer={
              <p className="mt-2 text-xs font-semibold text-[#2F7D4A]">
                {t("profile.memberCenter.statDatesHint")}
              </p>
            }
          />
          <DashStat
            label={t("profile.memberCenter.statJourney")}
            value={`${journeyStep}/${journeyTotal}`}
            footer={
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F4E9E4]">
                <div
                  className="h-full rounded-full bg-[#96734b]"
                  style={{ width: `${journeyPct}%` }}
                />
              </div>
            }
          />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm">
            <p className="text-xs font-extrabold uppercase tracking-[1.6px] text-dm-champagne">
              {t("profile.memberCenter.activeMatches")}
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-dm-ink">
              {t("profile.memberCenter.activeMatchesCount", {
                count: matchesActive,
              })}
            </p>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {matchPreviewUrls.length > 0 ? (
                matchPreviewUrls.map((src, i) => (
                  <Link
                    key={`${src}-${i}`}
                    href="/likes"
                    className="group relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="96px"
                      unoptimized
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 text-[10px] font-bold text-white">
                      {t("profile.memberCenter.matchPreview", { n: i + 1 })}
                    </span>
                  </Link>
                ))
              ) : (
                <Link
                  href="/discover"
                  className="flex h-28 min-w-[10rem] items-center justify-center rounded-2xl border border-dashed border-dm-line px-4 text-center text-xs font-semibold text-dm-muted"
                >
                  {t("profile.memberCenter.noMatchesYet")}
                </Link>
              )}
            </div>
          </div>
          <div className="rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm">
            <p className="text-xs font-extrabold uppercase tracking-[1.6px] text-dm-champagne">
              {t("profile.memberCenter.primaryCtaEyebrow")}
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-dm-ink">
              {primaryCtaLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-dm-muted">
              {t("profile.memberCenter.primaryCtaHint")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={primaryHref}>
                <Button type="button">{primaryCtaLabel}</Button>
              </Link>
              {logoutSlot}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="mgmt-heading">
        <div className="mb-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {t("profile.memberCenter.mgmtEyebrow")}
          </p>
          <h2
            id="mgmt-heading"
            className="mt-1 font-display text-2xl font-semibold text-dm-ink"
          >
            {t("profile.memberCenter.mgmtTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-dm-muted">
            {t("profile.memberCenter.mgmtHint")}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ME_MANAGEMENT_GROUPS.map((group) => (
            <div
              key={group.id}
              className="rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm"
            >
              <h3 className="font-display text-lg font-semibold text-dm-ink">
                {t(group.titleKey)}
              </h3>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-start justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#FBF6F3]"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-dm-ink group-hover:text-dm-primary">
                          {t(item.titleKey)}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-dm-muted">
                          {t(item.descKey)}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="mt-0.5 shrink-0 text-dm-champagne transition group-hover:text-dm-primary"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="next-actions-heading">
        <div className="mb-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {t("profile.memberCenter.actionsEyebrow")}
          </p>
          <h2
            id="next-actions-heading"
            className="mt-1 font-display text-2xl font-semibold text-dm-ink"
          >
            {t("profile.memberCenter.actionsTitle")}
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ME_NEXT_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group block h-full rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm transition hover:border-dm-primary"
            >
              <span
                className={
                  action.tone === "primary"
                    ? "inline-flex rounded-full bg-[#6B2D3C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                    : action.tone === "accent"
                      ? "inline-flex rounded-full bg-[#F4E9E4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#96734b]"
                      : "inline-flex rounded-full bg-dm-blush px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-dm-primary"
                }
              >
                {t("profile.memberCenter.actionBadge")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-dm-ink group-hover:text-dm-primary">
                {t(action.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dm-muted">
                {t(action.descKey)}
              </p>
              <span
                aria-hidden
                className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-dm-line text-dm-champagne transition group-hover:border-dm-primary group-hover:text-dm-primary"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {isStaff ? (
        <aside
          aria-label={t("profile.memberCenter.staffZone")}
          className="rounded-[14px] border border-dashed border-dm-line bg-[#FAF7F4] px-4 py-3"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-dm-muted">
            {t("profile.memberCenter.staffZone")}
          </p>
          <p className="mt-1 text-xs text-dm-muted">
            {t("profile.memberCenter.staffHint")}
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            <Link
              href="/ops/venues"
              className="font-semibold text-dm-ink underline underline-offset-2 hover:text-dm-primary"
            >
              {staffOpsLabel}
            </Link>
            <a
              href={adminUrl}
              className="font-semibold text-dm-ink underline underline-offset-2 hover:text-dm-primary"
              rel="noreferrer"
            >
              {staffAdminLabel}
            </a>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function DashStat({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm">
      <p className="text-xs font-semibold text-dm-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-dm-ink">
        {value}
      </p>
      {footer}
    </div>
  );
}
