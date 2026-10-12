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

/** Free OSM canvas via Leaflet — no Mapbox token required. */
export function CoupleOsmCanvas({ pins }: { pins: Pin[] }) {
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
    if (!containerRef.current || points.length === 0) return;
    let cancelled = false;
    let map: { remove: () => void } | null = null;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !containerRef.current) return;

        // Default marker assets break under bundlers without this fix.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const first = points[0];
        const instance = L.map(containerRef.current).setView(
          [first.lat, first.lng],
          12,
        );
        map = instance;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        }).addTo(instance);

        const bounds = L.latLngBounds([]);
        for (const p of points) {
          L.circleMarker([p.lat, p.lng], {
            radius: 8,
            color: "#6B2D3C",
            fillColor: "#6B2D3C",
            fillOpacity: 0.85,
          })
            .addTo(instance)
            .bindPopup(p.title);
          bounds.extend([p.lat, p.lng]);
        }
        if (points.length > 1) instance.fitBounds(bounds.pad(0.2));
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t("couple.osmInitError"),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoKey]);

  if (geoPins.length === 0) {
    return (
      <p className="m-auto px-4 text-center text-sm text-dm-muted">
        {t("couple.osmEmptyPins")}
      </p>
    );
  }

  if (error) {
    return (
      <p className="m-auto px-4 text-sm text-red-700" role="alert">
        {error}
      </p>
    );
  }

  return <div ref={containerRef} className="h-full w-full min-h-[16rem]" />;
}
