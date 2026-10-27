"use client";

import { useEffect, useRef, useState } from "react";

export type MapVenue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  priceHint?: string;
  selected?: boolean;
};

type LeafletMap = {
  remove: () => void;
  setView: (latlng: [number, number], zoom?: number) => void;
  fitBounds: (b: unknown, opts?: { padding?: number[] }) => void;
};
type LeafletMarker = {
  setStyle?: (s: Record<string, unknown>) => void;
  openPopup: () => void;
  on: (ev: string, fn: () => void) => void;
  bindPopup: (html: string) => LeafletMarker;
  addTo: (m: LeafletMap) => LeafletMarker;
  remove?: () => void;
};

/** Interactive OSM map for DateMap discovery — card/marker sync via callbacks. */
export function DateMapLeaflet({
  venues,
  selectedId,
  onSelect,
  onHover,
}: {
  venues: MapVenue[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const LRef = useRef<typeof import("leaflet") | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!containerRef.current) return;
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;
      LRef.current = L as unknown as typeof import("leaflet");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] =
        venues[0] != null ? [venues[0].lat, venues[0].lng] : [21.0285, 105.8542];
      const map = L.map(containerRef.current).setView(center, 13);
      mapRef.current = map as unknown as LeafletMap;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
      setReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current as unknown as {
      circleMarker: (
        latlng: [number, number],
        opts: Record<string, unknown>,
      ) => LeafletMarker;
      latLngBounds: (pts?: [number, number][]) => {
        extend: (p: [number, number]) => void;
        isValid: () => boolean;
      };
    } | null;
    if (!map || !L || !ready) return;

    for (const m of markersRef.current.values()) {
      (m as { remove?: () => void }).remove?.();
    }
    markersRef.current.clear();

    if (venues.length === 0) return;

    const bounds = L.latLngBounds([]);
    for (const v of venues) {
      const selected = v.id === selectedId;
      const marker = L.circleMarker([v.lat, v.lng], {
        radius: selected ? 11 : 8,
        color: selected ? "#A88A62" : "#6B2D3C",
        fillColor: selected ? "#A88A62" : "#6B2D3C",
        fillOpacity: 0.9,
        weight: selected ? 3 : 2,
      })
        .addTo(map)
        .bindPopup(
          `<strong>${escapeHtml(v.name)}</strong>${
            v.priceHint ? `<br/><span style="font-size:12px">${escapeHtml(v.priceHint)}</span>` : ""
          }`,
        );
      marker.on("click", () => onSelect(v.id));
      marker.on("mouseover", () => onHover(v.id));
      marker.on("mouseout", () => onHover(null));
      markersRef.current.set(v.id, marker);
      bounds.extend([v.lat, v.lng]);
    }

    if (selectedId) {
      const sel = venues.find((x) => x.id === selectedId);
      if (sel) {
        map.setView([sel.lat, sel.lng], 15);
        markersRef.current.get(selectedId)?.openPopup();
        return;
      }
    }
    if (bounds.isValid?.() !== false && venues.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (venues[0]) {
      map.setView([venues[0].lat, venues[0].lng], 13);
    }
  }, [venues, selectedId, onSelect, onHover, ready]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[320px] w-full rounded-dm-xl bg-dm-blush"
      role="application"
      aria-label="Bản đồ địa điểm hẹn"
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
