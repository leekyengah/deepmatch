"use client";

import { useT } from "@/components/i18n/I18nProvider";
import { useEffect, useRef, useState } from "react";

type Pin = {
  id: string;
  title: string;
  lat: number | null;
  lng: number | null;
  layer: string;
};

/**
 * Mapbox GL canvas — only mounts when token + at least one geocoded pin exist.
 * Falls back to null so parent can show the list UX.
 */
export function CoupleMapCanvas({
  token,
  pins,
}: {
  token: string;
  pins: Pin[];
}) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const geoPins = pins.filter(
    (p): p is Pin & { lat: number; lng: number } =>
      typeof p.lat === "number" && typeof p.lng === "number",
  );
  const geoKey = geoPins.map((p) => `${p.id}:${p.lat},${p.lng}`).join("|");

  useEffect(() => {
    const points = pins.filter(
      (p): p is Pin & { lat: number; lng: number } =>
        typeof p.lat === "number" && typeof p.lng === "number",
    );
    if (!token || !containerRef.current || points.length === 0) return;
    let cancelled = false;
    let map: { remove: () => void } | null = null;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = token;
        const first = points[0];
        const instance = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [first.lng, first.lat],
          zoom: 11,
        });
        map = instance;

        instance.on("load", () => {
          for (const p of points) {
            new mapboxgl.Marker({ color: "#E95383" })
              .setLngLat([p.lng, p.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 16 }).setText(p.title),
              )
              .addTo(instance);
          }
          if (points.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            for (const p of points) bounds.extend([p.lng, p.lat]);
            instance.fitBounds(bounds, { padding: 48, maxZoom: 13 });
          }
        });
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t("couple.mapboxInitError"),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- geoKey captures pin geometry
  }, [token, geoKey]);

  if (geoPins.length === 0) {
    return (
      <p className="px-4 text-sm text-dm-muted">
        {t("couple.mapboxEmptyPins")}
      </p>
    );
  }

  if (error) {
    return (
      <p className="px-4 text-sm text-red-700" role="alert">
        {error}
      </p>
    );
  }

  return <div ref={containerRef} className="h-full w-full min-h-[16rem]" />;
}
