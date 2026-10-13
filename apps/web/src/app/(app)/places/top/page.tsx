import Link from "next/link";
import { PlacesSubnav } from "@/components/places/PlacesSubnav";
import { Card } from "@/components/ui/Card";
import { LOVE_PLACE_CATEGORIES, topLovePlaces } from "@/lib/love-places";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function PlacesTopPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; cat?: string }>;
}) {
  const { t } = await getServerTranslator();
  const sp = await searchParams;
  const city = sp.city || "Hà Nội";
  const cat = (sp.cat as "cafe" | "restaurant" | undefined) || undefined;
  const ranked = topLovePlaces(city, cat);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("places.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("places.topTitle", { city })}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("places.topIntro")}</p>
      <PlacesSubnav active="top" />

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {["Hà Nội", "TP. Hồ Chí Minh"].map((c) => (
          <Link
            key={c}
            href={`/places/top?city=${encodeURIComponent(c)}${cat ? `&cat=${cat}` : ""}`}
            className={c === city ? "font-semibold text-dm-primary" : "text-dm-muted"}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        <Link
          href={`/places/top?city=${encodeURIComponent(city)}`}
          className={!cat ? "font-semibold text-dm-primary" : "text-dm-muted"}
        >
          {t("places.allCategories")}
        </Link>
        {LOVE_PLACE_CATEGORIES.filter((c) =>
          ["cafe", "restaurant", "stay"].includes(c.id),
        ).map((c) => (
          <Link
            key={c.id}
            href={`/places/top?city=${encodeURIComponent(city)}&cat=${c.id}`}
            className={cat === c.id ? "font-semibold text-dm-primary" : "text-dm-muted"}
          >
            {c.labelVi}
          </Link>
        ))}
      </div>

      {!ranked.length ? (
        <Card className="mt-8 text-sm text-dm-muted">{t("places.topEmpty")}</Card>
      ) : (
        <ol className="mt-8 space-y-3">
          {ranked.map(({ place, score }, i) => (
            <li key={place.id}>
              <Link href={`/places/${place.id}`}>
                <Card className="transition hover:border-dm-primary">
                  <div className="flex gap-4">
                    <span className="font-display text-2xl font-semibold text-dm-champagne">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-dm-ink">{place.name}</p>
                      <p className="mt-1 text-xs text-dm-muted">
                        {place.address} · score {score.toFixed(2)} · {place.ratingCount}{" "}
                        {t("places.reviews")}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
