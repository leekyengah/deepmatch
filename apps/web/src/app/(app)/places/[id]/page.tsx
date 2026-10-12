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
  const reviews = place.reviews ?? [];

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
      {place.hoursHint ? (
        <p className="mt-1 text-sm text-dm-muted">
          {t("places.hoursLabel")}: {place.hoursHint}
        </p>
      ) : null}
      {place.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-dm-muted">{t("places.tagsLabel")}:</span>
          {place.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      ) : null}

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

      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold text-dm-ink">
          {t("places.publicReviewsTitle")}
        </h2>
        <p className="mt-1 text-sm text-dm-muted">{t("places.publicReviewsIntro")}</p>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-dm-muted">{t("places.noReviews")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r.id}>
                <Card className="space-y-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="good">{r.rating}/5</Badge>
                    <span className="font-medium text-dm-ink">{r.authorLabel}</span>
                    <span className="text-xs text-dm-muted">{r.createdAt}</span>
                  </div>
                  <p className="leading-relaxed text-dm-ink">{r.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

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
