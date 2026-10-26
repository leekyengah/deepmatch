import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type OverviewPin = {
  id: string;
  title: string;
  note: string | null;
  place_label: string | null;
  visited_on: string | null;
  layer: string;
  lat: number | null;
  lng: number | null;
};

export type OverviewDate = {
  id: string;
  title: string;
  starts_at: string;
  place_label: string | null;
  status: string;
};

export type OverviewWish = {
  id: string;
  title: string;
  note: string | null;
  place_label: string | null;
};

function formatDayBox(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "—", mon: "" };
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d
    .toLocaleDateString("vi-VN", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  return { day, mon };
}

function formatPinDate(visitedOn: string | null) {
  if (!visitedOn) return null;
  const [y, m, d] = visitedOn.split("-");
  if (!y || !m || !d) return visitedOn;
  return `${d}.${m}.${y}`;
}

export function CoupleOverview({
  latest,
  upcoming,
  wishes,
  pinCount,
  labels,
}: {
  latest: OverviewPin | null;
  upcoming: OverviewDate | null;
  wishes: OverviewWish[];
  pinCount: number;
  labels: {
    latestTitle: string;
    upcomingTitle: string;
    mapTitle: string;
    openMap: string;
    wishTitle: string;
    addWish: string;
    noLatest: string;
    noLatestBody: string;
    addMemory: string;
    noUpcoming: string;
    proposeDate: string;
    confirmed: string;
    proposed: string;
    firstStepsTitle: string;
    stepCover: string;
    stepMemory: string;
    stepWish: string;
  };
}) {
  const showFirstSteps = !latest && !upcoming && wishes.length === 0;

  return (
    <div className="space-y-6">
      {showFirstSteps ? (
        <section className="rounded-[18px] border border-dashed border-dm-champagne/50 bg-dm-surface/80 p-5">
          <h2 className="font-display text-xl font-semibold text-dm-ink">
            {labels.firstStepsTitle}
          </h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-3">
            <StepLink href="/couple/us" n={1} label={labels.stepCover} />
            <StepLink href="/couple/add" n={2} label={labels.stepMemory} />
            <StepLink href="/couple/promises" n={3} label={labels.stepWish} />
          </ol>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Latest moment — left large */}
        <section className="lg:col-span-7">
          <h2 className="mb-3 font-display text-xl font-semibold text-dm-ink">
            {labels.latestTitle}
          </h2>
          {latest ? (
            <Link href="/couple/memories" className="block">
              <article className="overflow-hidden rounded-[18px] border border-dm-line bg-dm-panel shadow-sm transition hover:border-dm-primary/40">
                <div className="grid sm:grid-cols-2">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-dm-deep via-[#5a3340] to-dm-blush sm:aspect-auto sm:min-h-[220px]">
                    <div className="absolute inset-0 flex items-end p-4">
                      <span className="rounded-full bg-black/35 px-2 py-1 text-[11px] font-semibold text-white">
                        {formatPinDate(latest.visited_on) ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-5">
                    <h3 className="font-display text-2xl font-semibold text-dm-ink">
                      {latest.title}
                    </h3>
                    {latest.note ? (
                      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-dm-muted">
                        {latest.note}
                      </p>
                    ) : latest.place_label ? (
                      <p className="mt-2 text-sm text-dm-muted">
                        {latest.place_label}
                      </p>
                    ) : null}
                    <p className="mt-4 text-xs font-semibold text-dm-champagne">
                      {formatPinDate(latest.visited_on)}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ) : (
            <div className="rounded-[18px] border border-dm-line bg-dm-panel p-6">
              <p className="font-semibold text-dm-ink">{labels.noLatest}</p>
              <p className="mt-1 text-sm text-dm-muted">{labels.noLatestBody}</p>
              <Link href="/couple/add" className="mt-4 inline-block">
                <Button type="button" size="sm">
                  {labels.addMemory}
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Right column: upcoming + map */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-dm-ink">
              {labels.upcomingTitle}
            </h2>
            {upcoming ? (
              <Link href="/couple/promises" className="block">
                <article className="rounded-[18px] border border-dm-line bg-dm-panel p-4 shadow-sm transition hover:border-dm-primary/40">
                  <div className="flex gap-4">
                    <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-dm-primary text-white">
                      <span className="font-display text-2xl font-semibold leading-none">
                        {formatDayBox(upcoming.starts_at).day}
                      </span>
                      <span className="mt-1 text-[10px] font-bold tracking-wide">
                        {formatDayBox(upcoming.starts_at).mon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-dm-ink">
                        {upcoming.title}
                      </h3>
                      <p className="mt-1 text-sm text-dm-muted">
                        {new Date(upcoming.starts_at).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                        {upcoming.place_label
                          ? ` · ${upcoming.place_label}`
                          : ""}
                      </p>
                      <div className="mt-2">
                        <Badge
                          tone={
                            upcoming.status === "confirmed" ? "good" : "warn"
                          }
                        >
                          {upcoming.status === "confirmed"
                            ? labels.confirmed
                            : labels.proposed}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ) : (
              <div className="rounded-[18px] border border-dm-line bg-dm-panel p-5">
                <p className="text-sm text-dm-muted">{labels.noUpcoming}</p>
                <Link href="/couple/promises" className="mt-3 inline-block">
                  <Button type="button" size="sm" variant="outline">
                    {labels.proposeDate}
                  </Button>
                </Link>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-dm-ink">
              {labels.mapTitle}
            </h2>
            <Link href="/couple/map" className="block">
              <article className="overflow-hidden rounded-[18px] border border-dm-line bg-dm-panel shadow-sm transition hover:border-dm-primary/40">
                <div className="relative h-36 bg-[linear-gradient(160deg,#e8efe8_0%,#d4e0d8_40%,#c5d4c9_100%)]">
                  <MiniMapDots count={Math.min(pinCount, 5)} />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-white/95 to-transparent px-4 pb-3 pt-8">
                    <span className="text-xs font-semibold text-dm-ink">
                      {pinCount} ghim
                    </span>
                    <span className="rounded-full bg-dm-primary px-3 py-1.5 text-xs font-semibold text-white">
                      {labels.openMap}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        </div>
      </div>

      {/* Wishlist row */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-dm-ink">
          {labels.wishTitle}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {wishes.map((w) => (
            <Link
              key={w.id}
              href="/couple/promises"
              className="w-44 shrink-0 overflow-hidden rounded-2xl border border-dm-line bg-dm-panel shadow-sm transition hover:border-dm-primary/40"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-dm-blush via-dm-surface to-dm-champagne/30" />
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-dm-ink">
                    {w.title}
                  </p>
                  {w.place_label ? (
                    <p className="truncate text-xs text-dm-muted">
                      {w.place_label}
                    </p>
                  ) : null}
                </div>
                <span
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-dm-line"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
          <Link
            href="/couple/add"
            className="flex w-44 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-dm-champagne/60 bg-dm-surface/60 p-4 text-center transition hover:border-dm-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dm-line text-xl text-dm-primary">
              +
            </span>
            <p className="mt-2 text-xs font-medium text-dm-muted">
              {labels.addWish}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepLink({
  href,
  n,
  label,
}: {
  href: string;
  n: number;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl border border-dm-line bg-dm-panel px-3 py-3 text-sm font-medium text-dm-ink transition hover:border-dm-primary"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-dm-primary text-xs font-bold text-white">
          {n}
        </span>
        {label}
      </Link>
    </li>
  );
}

function MiniMapDots({ count }: { count: number }) {
  const spots = [
    { t: "28%", l: "35%" },
    { t: "45%", l: "55%" },
    { t: "38%", l: "70%" },
    { t: "55%", l: "40%" },
    { t: "22%", l: "60%" },
  ];
  return (
    <div className="absolute inset-0" aria-hidden>
      {spots.slice(0, Math.max(count, 1)).map((s, i) => (
        <span
          key={i}
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-dm-primary shadow"
          style={{ top: s.t, left: s.l }}
        />
      ))}
    </div>
  );
}
