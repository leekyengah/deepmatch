import Link from "next/link";
import { notFound } from "next/navigation";
import { PlacesSubnav } from "@/components/places/PlacesSubnav";
import { PlaceReviewClient } from "@/components/places/PlaceReviewClient";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { lovePlaceById, LOVE_PLACE_CATEGORIES } from "@/lib/love-places";
import { getServerTranslator } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { createSignedReadUrl } from "@/lib/media/storage";
import { getStorageBackend, type StorageBackend } from "@/lib/media/limits";

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
  const supabase = await createClient();
  const { data: liveRows } = await supabase
    .from("place_reviews")
    .select("id, rating, body, created_at, media_id, profiles(display_name)")
    .eq("place_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(30);

  const liveReviews: Array<{
    id: string;
    rating: number;
    body: string;
    authorLabel: string;
    createdAt: string;
    mediaUrl: string | null;
  }> = [];
  for (const row of liveRows ?? []) {
    let mediaUrl: string | null = null;
    if (row.media_id) {
      const { data: media } = await supabase
        .from("media_objects")
        .select("storage_path, storage_backend, processing_status")
        .eq("id", row.media_id)
        .maybeSingle();
      if (
        media &&
        (!media.processing_status || media.processing_status === "ready")
      ) {
        mediaUrl = await createSignedReadUrl(
          media.storage_path,
          (media.storage_backend ?? getStorageBackend()) as StorageBackend,
          600,
        );
      }
    }
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    liveReviews.push({
      id: row.id,
      rating: row.rating,
      body: row.body,
      authorLabel:
        (profile as { display_name?: string } | null)?.display_name ?? "Member",
      createdAt: String(row.created_at).slice(0, 10),
      mediaUrl,
    });
  }
  const reviews = [
    ...liveReviews,
    ...(place.reviews ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      authorLabel: r.authorLabel,
      createdAt: r.createdAt,
      mediaUrl: null as string | null,
    })),
  ];

  return (
    <div className="dm-page-frame dm-page-frame--standard">
      <Link href="/places/map" className="text-sm text-dm-muted underline">
        {t("places.backMap")}
      </Link>
      <PlacesSubnav active="map" />
      <div className="mt-6">
        {cat ? <Badge>{cat.labelVi}</Badge> : null}
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
                  {r.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.mediaUrl}
                      alt=""
                      className="mt-2 max-h-48 w-full rounded-dm object-cover"
                    />
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <PlaceReviewClient placeId={place.id} />
        <Link href="/couple/add" className="sm:flex-1">
          <Button type="button" variant="outline" className="w-full">
            {t("places.addPrivateMemory")}
          </Button>
        </Link>
      </div>
      <div className="mt-3">
        <a
          href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-dm-muted underline"
        >
          {t("places.directions")}
        </a>
      </div>
      <p className="mt-4 text-xs text-dm-muted">{t("places.detailDisclaimer")}</p>
      <p className="mt-1 text-xs text-dm-muted">{t("places.publicPrivateSplit")}</p>
    </div>
  );
}
