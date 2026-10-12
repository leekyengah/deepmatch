import type { LovePlace } from "@/lib/love-places";

/** Editorial SVG plane — not a live map provider. Positions from sample lat/lng. */
export function SampleMapCanvas({
  places,
  title,
  body,
  note,
}: {
  places: LovePlace[];
  title: string;
  body: string;
  note: string;
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
    return { ...p, x: Math.min(92, Math.max(8, x)), y: Math.min(88, Math.max(12, y)), i };
  });

  return (
    <div className="relative min-h-[300px] overflow-hidden bg-[linear-gradient(160deg,#f7f3ee_0%,#ebe3d8_45%,#d9cbb8_100%)]">
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
            <circle cx={p.x} cy={p.y} r="3.6" fill="none" stroke="#A88A62" strokeWidth="0.5" />
            <text
              x={p.x}
              y={p.y - 4}
              textAnchor="middle"
              fill="#241A1C"
              fontSize="2.4"
              fontFamily="Georgia, serif"
            >
              {p.i + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className="relative z-[1] flex min-h-[300px] flex-col justify-end p-5">
        <div className="max-w-md rounded-dm bg-dm-panel/90 px-4 py-3 shadow-sm backdrop-blur-sm">
          <p className="font-display text-xl text-dm-ink">{title}</p>
          <p className="mt-1 text-sm text-dm-muted">{body}</p>
          <p className="mt-2 text-xs text-dm-muted">{note}</p>
        </div>
      </div>
    </div>
  );
}
