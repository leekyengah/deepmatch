import Link from "next/link";
import type { ActiveCouple } from "@/lib/couple";
import { coupleDisplayName, daysTogether } from "@/lib/couple";

function Initial({ name }: { name: string }) {
  const letter = (name.trim()[0] || "?").toUpperCase();
  return (
    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dm-blush to-dm-deep font-display text-2xl font-semibold text-white">
      {letter}
    </span>
  );
}

export function CoupleHero({
  couple,
  coverUrl,
  labels,
}: {
  couple: ActiveCouple;
  coverUrl?: string | null;
  labels: {
    daysTogether: string;
    setStartDate: string;
    changeCover: string;
    onlyTwo: string;
    spaceHeading: string;
  };
}) {
  const names = coupleDisplayName(couple);
  const days = daysTogether(couple.started_on);
  const motto =
    couple.motto?.trim() ||
    null;

  return (
    <section className="overflow-hidden rounded-[22px] border border-dm-line bg-dm-panel shadow-dm">
      <div className="relative min-h-[220px] sm:min-h-[280px]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#3a1820] via-[#6B2D3C] to-[#A88A62]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />

        <div className="relative flex h-full min-h-[220px] flex-col justify-between gap-4 p-4 sm:min-h-[280px] sm:p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[1.5px] text-white/80">
                {labels.spaceHeading}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                <LockIcon />
                {labels.onlyTwo}
              </span>
            </div>
            <Link
              href="/couple/us"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/40"
            >
              <CameraIcon />
              {labels.changeCover}
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <div className="flex -space-x-4">
                <Polaroid name={couple.self.display_name} rotate="-rotate-3" />
                <Polaroid name={couple.partner.display_name} rotate="rotate-2" />
              </div>
              <div className="pb-1 text-white">
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                  {names}
                </h1>
                <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
                  {days != null
                    ? labels.daysTogether.replace("{count}", String(days))
                    : labels.setStartDate}
                </p>
              </div>
            </div>
            {motto ? (
              <p className="max-w-xs font-editorial text-sm italic leading-relaxed text-white/90 sm:text-right md:text-base">
                “{motto}”
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Polaroid({ name, rotate }: { name: string; rotate: string }) {
  return (
    <div
      className={`w-14 overflow-hidden rounded-sm border-[3px] border-white bg-white shadow-md sm:w-[4.5rem] ${rotate}`}
    >
      <div className="aspect-portrait w-full overflow-hidden bg-dm-surface">
        <Initial name={name} />
      </div>
      <p className="truncate px-0.5 pt-0.5 text-center text-[8px] font-semibold text-dm-ink">
        {name}
      </p>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h3l2-2h6l2 2h3v11H4V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
