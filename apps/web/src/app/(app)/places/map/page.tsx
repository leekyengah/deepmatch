import Link from "next/link";
import { PlacesSubnav } from "@/components/places/PlacesSubnav";
import { SampleMapCanvas } from "@/components/places/SampleMapCanvas";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LOVE_PLACES, LOVE_PLACE_CATEGORIES } from "@/lib/love-places";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function PlacesMapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; cat?: string }>;
}) {
  const { t } = await getServerTranslator();
  const sp = await searchParams;
  const city = sp.city || "Hà Nội";
  const cat = sp.cat;
  const places = LOVE_PLACES.filter(
    (p) => p.city === city && (!cat || p.category === cat),
  );

  const cities = ["Hà Nội", "TP. Hồ Chí Minh"];

  return (
    <div className="dm-page-frame dm-page-frame--wide">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("places.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("places.mapTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-dm-muted">{t("places.mapIntro")}</p>
      <PlacesSubnav active="map" />

      <div className="mt-6 flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c}
            href={`/places/map?city=${encodeURIComponent(c)}${cat ? `&cat=${cat}` : ""}`}
            className={
              c === city
                ? "rounded-dm bg-dm-blush px-3 py-1.5 text-sm font-semibold text-dm-primary"
                : "rounded-dm border border-dm-line px-3 py-1.5 text-sm text-dm-muted"
            }
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/places/map?city=${encodeURIComponent(city)}`}
          className={!cat ? "text-sm font-semibold text-dm-primary" : "text-sm text-dm-muted"}
        >
          {t("places.allCategories")}
        </Link>
        {LOVE_PLACE_CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/places/map?city=${encodeURIComponent(city)}&cat=${c.id}`}
            className={
              cat === c.id
                ? "text-sm font-semibold text-dm-primary"
                : "text-sm text-dm-muted"
            }
          >
            {c.labelVi}
          </Link>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <SampleMapCanvas
          places={places}
          title={t("places.mapCanvasTitle")}
          body={t("places.mapCanvasBody", { count: places.length, city })}
          note={t("places.mapFallbackNote")}
          detailLabel={t("common.viewDetails")}
          directionsLabel={t("places.directions")}
        />
      </Card>

      <ul className="mt-6 space-y-3">
        {places.map((p) => (
          <li key={p.id}>
            <Link href={`/places/${p.id}`}>
              <Card className="transition hover:border-dm-primary">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-dm-ink">{p.name}</p>
                    <p className="mt-1 text-xs text-dm-muted">
                      {p.district} · {p.address}
                    </p>
                    <p className="mt-2 text-sm text-dm-muted">{p.blurb}</p>
                  </div>
                  <Badge>{p.priceHint}</Badge>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
