import Link from "next/link";
import type { LovePlace } from "@/lib/love-places";

/** Editorial SVG plane — not a live map provider. Positions from sample lat/lng. */
export function SampleMapCanvas({
  places,
  title,
  body,
  note,
  detailLabel,
  directionsLabel,
}: {
  places: LovePlace[];
  title: string;
  body: string;
  note: string;
  detailLabel?: string;
  directionsLabel?: string;
}) {
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const minLat = Math.min(...lats, 0);
  const maxLat = Math.max(...lats, 1);
  const minLng = Math.min(...lngs, 0);
  const maxLng = Math.max(...lngs, 1);
  const pad = 0.02;
  const latSpan = Math.max(maxLat - minLat, 0.01) + pad * 2;
  const lngSpan = Math.max(maxLng - minLng, 0.01) + pad * 2;

  const points = places.map((p, i) => {
    const x = ((p.lng - (minLng - pad)) / lngSpan) * 100;
    const y = (1 - (p.lat - (minLat - pad)) / latSpan) * 100;
    return {
      ...p,
      x: Math.min(92, Math.max(8, x)),
      y: Math.min(88, Math.max(12, y)),
      i,
    };
  });

  const featured = places[0] ?? null;

  return (
    <div className="relative min-h-[360px] overflow-hidden bg-[linear-gradient(160deg,#f7f3ee_0%,#ebe3d8_45%,#d9cbb8_100%)]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id="dm-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path
              d="M 8 0 L 0 0 0 8"
              fill="none"
              stroke="rgba(71,32,37,0.06)"
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dm-grid)" />
        {points.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r="2.2" fill="#6B2D3C" opacity="0.9" />
            <circle
              cx={p.x}
              cy={p.y}
              r="3.6"
              fill="none"
              stroke="#A88A62"
              strokeWidth="0.5"
            />
            <text
              x={p.x}
              y={p.y - 4.5}
              textAnchor="middle"
              fill="#6B2D3C"
              fontSize="2.2"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {(p.ratingMean ?? 0).toFixed(1)}
            </text>
          </g>
        ))}
      </svg>

      <div className="relative z-[1] flex min-h-[360px] flex-col justify-between p-4 sm:p-5">
        <div className="max-w-sm rounded-dm bg-dm-panel/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <p className="font-display text-lg text-dm-ink">{title}</p>
          <p className="text-xs text-dm-muted">{body}</p>
        </div>

        {featured ? (
          <article className="mt-auto max-w-md rounded-2xl border border-dm-line bg-dm-panel p-3 shadow-md sm:p-4">
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br from-dm-blush to-dm-champagne/40" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-dm-ink">{featured.name}</p>
                <p className="mt-0.5 truncate text-xs text-dm-muted">
                  {featured.address}
                </p>
                <p className="mt-1 text-xs font-semibold text-dm-primary">
                  {featured.ratingMean ?? "—"} · {featured.ratingCount} ·{" "}
                  {featured.priceHint}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/places/${featured.id}`}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-dm-line px-3 py-2 text-xs font-semibold text-dm-ink"
              >
                {detailLabel ?? "Chi tiết"}
              </Link>
              <a
                href={`https://www.openstreetmap.org/?mlat=${featured.lat}&mlon=${featured.lng}#map=16/${featured.lat}/${featured.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-dm-primary px-3 py-2 text-xs font-semibold text-white"
              >
                {directionsLabel ?? "Chỉ đường"} →
              </a>
            </div>
            <p className="mt-2 text-[10px] text-dm-muted">{note}</p>
          </article>
        ) : (
          <p className="text-xs text-dm-muted">{note}</p>
        )}
      </div>
    </div>
  );
}
