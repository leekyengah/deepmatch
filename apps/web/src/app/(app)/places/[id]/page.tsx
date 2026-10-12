import Link from "next/link";
import { notFound } from "next/navigation";
import { PlacesSubnav } from "@/components/places/PlacesSubnav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { lovePlaceById, LOVE_PLACE_CATEGORIES } from "@/lib/love-places";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getServerTranslator();
  const place = lovePlaceById(id);
  if (!place) notFound();
  const cat = LOVE_PLACE_CATEGORIES.find((c) => c.id === place.category);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/places/map" className="text-sm text-dm-muted underline">
        {t("places.backMap")}
      </Link>
      <PlacesSubnav active="map" />
      <div className="mt-6">
        <Badge tone="warn">{t("places.sampleBadge")}</Badge>
        {cat ? <Badge className="ml-2">{cat.labelVi}</Badge> : null}
      </div>
      <h1 className="mt-3 font-display text-4xl font-semibold text-dm-ink">
        {place.name}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{place.address}</p>
      <p className="mt-1 text-sm font-semibold text-dm-primary">{place.priceHint}</p>

      <Card className="mt-8 space-y-4 text-sm leading-relaxed">
        <p>{place.blurb}</p>
        <p className="text-dm-muted">
          {place.ratingCount > 0
            ? t("places.ratingLine", {
                mean: String(place.ratingMean),
                count: String(place.ratingCount),
              })
            : t("places.noReviews")}
        </p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button type="button" variant="outline">
            {t("places.directions")}
          </Button>
        </a>
        <Link href="/couple/add">
          <Button type="button" variant="secondary">
            {t("places.addPrivateMemory")}
          </Button>
        </Link>
      </div>
      <p className="mt-4 text-xs text-dm-muted">{t("places.detailDisclaimer")}</p>
    </div>
  );
}
