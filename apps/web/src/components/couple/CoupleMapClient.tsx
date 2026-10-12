"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useT } from "@/components/i18n/I18nProvider";
import { LoadingState } from "@/components/ui/LoadingState";

const CoupleMapCanvas = dynamic(
  () =>
    import("@/components/couple/CoupleMapCanvas").then((m) => m.CoupleMapCanvas),
  { ssr: false },
);
const CoupleOsmCanvas = dynamic(
  () =>
    import("@/components/couple/CoupleOsmCanvas").then((m) => m.CoupleOsmCanvas),
  { ssr: false },
);

type Pin = {
  id: string;
  layer: "visited" | "wishlist" | "milestone";
  title: string;
  note: string | null;
  place_label: string | null;
  lat: number | null;
  lng: number | null;
  visited_on: string | null;
};

export function CoupleMapClient({ coupleId }: { coupleId: string | null }) {
  const t = useT();
  const layerLabel: Record<Pin["layer"], string> = {
    visited: t("couple.layerVisited"),
    wishlist: t("couple.layerWishlist"),
    milestone: t("couple.layerMilestone"),
  };
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [layer, setLayer] = useState<Pin["layer"]>("visited");
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [filter, setFilter] = useState<"all" | Pin["layer"]>("all");
  const mapbox = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const load = useCallback(async () => {
    if (!coupleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/v1/couples/${coupleId}/pins`);
    if (!res.ok) {
      setError(t("couple.mapLoadPinsError"));
      setLoading(false);
      return;
    }
    const json = (await res.json()) as { data?: { pins?: Pin[] } };
    setPins(json.data?.pins ?? []);
    setError(null);
    setLoading(false);
  }, [coupleId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addPin(e: React.FormEvent) {
    e.preventDefault();
    if (!coupleId || !title.trim()) return;
    setSaving(true);
    const latN = lat.trim() ? Number(lat) : undefined;
    const lngN = lng.trim() ? Number(lng) : undefined;
    const res = await fetch(`/api/v1/couples/${coupleId}/pins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        layer,
        location: {
          name: place.trim() || undefined,
          latitude:
            latN !== undefined && Number.isFinite(latN) ? latN : undefined,
          longitude:
            lngN !== undefined && Number.isFinite(lngN) ? lngN : undefined,
        },
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(resolveApiErrorMessage(body, t, "couple.addPinFailed"));
      return;
    }
    setTitle("");
    setPlace("");
    setLat("");
    setLng("");
    await load();
  }

  async function removePin(pinId: string) {
    if (!coupleId) return;
    const res = await fetch(
      `/api/v1/couples/${coupleId}/pins?pin_id=${encodeURIComponent(pinId)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(resolveApiErrorMessage(body, t, "couple.mapDeleteFailed"));
      return;
    }
    await load();
  }

  async function geocodePlace() {
    const q = place.trim() || title.trim();
    if (!q) return;
    setGeocoding(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/geocode?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as {
        error?: { message?: string };
        data?: { result?: { lat: number; lng: number; label?: string } | null };
      };
      if (!res.ok) {
        setError(resolveApiErrorMessage(json, t, "couple.mapGeocodeFailed"));
        return;
      }
      const hit = json.data?.result;
      if (!hit) {
        setError(t("couple.mapPlaceNotFound"));
        return;
      }
      setLat(String(hit.lat));
      setLng(String(hit.lng));
      if (hit.label && !place.trim()) setPlace(hit.label);
    } finally {
      setGeocoding(false);
    }
  }

  async function promoteWishlist(pinId: string) {
    if (!coupleId) return;
    const res = await fetch(`/api/v1/couples/${coupleId}/pins`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin_id: pinId, layer: "visited" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(resolveApiErrorMessage(body, t, "couple.mapLayerFailed"));
      return;
    }
    await load();
  }

  const visible =
    filter === "all" ? pins : pins.filter((p) => p.layer === filter);

  if (!coupleId) {
    return (
      <EmptyState
        title={t("couple.mapEmptySpaceTitle")}
        description={t("couple.mapEmptySpaceBody")}
        action={
          <Link href="/couple/invite">
            <Button type="button">{t("couple.mapInviteCta")}</Button>
          </Link>
        }
      />
    );
  }

  if (loading) return <LoadingState label={t("couple.mapLoading")} />;

  return (
    <div className="space-y-6">
      <Card className="flex h-64 flex-col overflow-hidden p-0">
        {mapbox ? (
          <CoupleMapCanvas token={mapbox} pins={pins} />
        ) : (
          <CoupleOsmCanvas pins={pins} />
        )}
      </Card>
      {!mapbox ? (
        <p className="text-xs text-dm-muted">
          {t("couple.mapOsmHint")}
        </p>
      ) : null}

      <form onSubmit={addPin} className="grid gap-3 rounded-dm border border-dm-line bg-dm-panel p-4 sm:grid-cols-2">
        <Input
          placeholder={t("couple.pinTitlePh")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder={t("couple.pinPlacePh")}
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
        <Input
          placeholder={t("couple.pinLatPh")}
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          inputMode="decimal"
        />
        <Input
          placeholder={t("couple.pinLngPh")}
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          inputMode="decimal"
        />
        <select
          className="rounded-dm border border-[#efcfda] bg-white px-3 py-2 text-sm"
          value={layer}
          onChange={(e) => setLayer(e.target.value as Pin["layer"])}
        >
          <option value="visited">{t("couple.layerVisited")}</option>
          <option value="wishlist">{t("couple.layerWishlist")}</option>
          <option value="milestone">{t("couple.layerMilestone")}</option>
        </select>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={geocoding || !place.trim()}
            onClick={() => void geocodePlace()}
          >
            {geocoding ? t("couple.geocoding") : t("couple.geocode")}
          </Button>
          <Button type="submit" disabled={saving}>
            {t("couple.submitPin")}
          </Button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        {(
          [
            ["all", t("couple.filterAll")],
            ["visited", t("couple.layerVisited")],
            ["wishlist", t("couple.layerWishlist")],
            ["milestone", t("couple.layerMilestone")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`rounded-dm border px-3 py-1 ${
              filter === key
                ? "border-dm-primary bg-dm-blush/40 text-dm-raspberry"
                : "border-dm-line text-dm-muted"
            }`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {pins.length === 0 ? (
        <EmptyState
          title={t("couple.pinsEmptyTitle")}
          description={t("couple.pinsEmptyBody")}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title={t("couple.pinsFilterEmptyTitle")}
          description={t("couple.pinsFilterEmptyBody")}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((p) => (
            <li key={p.id}>
              <Card>
                <p className="text-xs font-bold uppercase tracking-wide text-dm-primary">
                  {layerLabel[p.layer]}
                </p>
                <p className="mt-1 font-semibold text-dm-raspberry">{p.title}</p>
                <p className="text-sm text-dm-muted">
                  {p.place_label || t("couple.noExactCoords")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.layer === "wishlist" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void promoteWishlist(p.id)}
                    >
                      {t("couple.markVisited")}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void removePin(p.id)}
                  >
                    {t("couple.deleteMyPin")}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
