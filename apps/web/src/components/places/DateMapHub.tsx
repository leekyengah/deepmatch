"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/components/ui/cn";
import { DateMapLeaflet } from "@/components/places/DateMapLeaflet";

type PlaceDto = {
  id: string;
  name: string;
  category: string;
  city: string;
  district: string;
  full_address: string;
  lat: number;
  lng: number;
  blurb: string;
  price_hint: string;
  budget_couple_min_vnd: number | null;
  budget_couple_max_vnd: number | null;
  outdoor: boolean | null;
  parking: boolean | null;
  photo_friendly: boolean | null;
  tags: string[];
  rating_mean: number | null;
  rating_count: number;
  sample: true;
  dss: {
    match_class: string;
    score: number | null;
    confidence: number;
  };
};

const FAV_KEY = "dm_datemap_fav_v1";
const CITIES = ["Hà Nội", "TP. Hồ Chí Minh"];
const CHIPS: { id: string; cat?: string; outdoor?: boolean; parking?: boolean; photo?: boolean }[] = [
  { id: "all" },
  { id: "cafe", cat: "cafe" },
  { id: "restaurant", cat: "restaurant" },
  { id: "outdoor", outdoor: true },
  { id: "parking", parking: true },
  { id: "photo", photo: true },
];

function loadFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function DateMapHub() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const city = sp.get("city") || "Hà Nội";
  const category = sp.get("cat") || "cafe";
  const budgetMax = Number(sp.get("budget") || "500000");
  const intent = sp.get("intent") || "first";
  const atmosphere = sp.get("atm") || "quiet";
  const sort = sp.get("sort") || "match";
  const strict = sp.get("strict") === "1";
  const outdoor = sp.get("outdoor") === "1";
  const parking = sp.get("parking") === "1";
  const photo = sp.get("photo") === "1";
  const q = sp.get("q") || "";

  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [mobilePane, setMobilePane] = useState<"list" | "map" | "filters">("list");
  const [favs, setFavs] = useState<string[]>([]);
  const [planOpen, setPlanOpen] = useState(false);
  const [planPlace, setPlanPlace] = useState<PlaceDto | null>(null);
  const [planAt, setPlanAt] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [planMsg, setPlanMsg] = useState<string | null>(null);
  const [draftQ, setDraftQ] = useState(q);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setFavs(loadFavs());
  }, []);

  const patchParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, sp],
  );

  useEffect(() => {
    const tmr = setTimeout(() => {
      if (draftQ !== q) patchParams({ q: draftQ || null });
    }, 300);
    return () => clearTimeout(tmr);
  }, [draftQ, q, patchParams]);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      city,
      limit: "40",
      sort,
      budgetMax: String(budgetMax),
    });
    if (category && category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    if (strict) params.set("strict", "1");
    if (outdoor) params.set("outdoor", "1");
    if (parking) params.set("parking", "1");
    if (photo) params.set("photo", "1");

    fetch(`/api/v1/places?${params}`, { signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("load_failed");
        return r.json() as Promise<{ data: { places: PlaceDto[] } }>;
      })
      .then((j) => {
        setPlaces(j.data.places);
        if (j.data.places[0] && !selectedId) {
          setSelectedId(j.data.places[0].id);
        }
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(t("places.loadError"));
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, category, budgetMax, sort, strict, outdoor, parking, photo, q, t]);

  const mapVenues = useMemo(
    () =>
      places.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        priceHint: p.price_hint,
        selected: p.id === (hoverId || selectedId),
      })),
    [places, selectedId, hoverId],
  );

  const onSelectVenue = useCallback((id: string) => setSelectedId(id), []);
  const onHoverVenue = useCallback((id: string | null) => setHoverId(id), []);

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function submitPlan() {
    setPlanMsg(null);
    if (!planPlace || !planAt) {
      setPlanMsg(t("places.planNeedTime"));
      return;
    }
    const coupleRes = await fetch("/api/v1/couples/active");
    if (coupleRes.status === 401) {
      router.push("/login");
      return;
    }
    let coupleId: string | null = null;
    if (coupleRes.ok) {
      const j = (await coupleRes.json()) as { data?: { couple?: { id: string } } };
      coupleId = j.data?.couple?.id ?? null;
    }
    if (!coupleId) {
      setPlanMsg(t("places.planNeedCouple"));
      return;
    }
    const res = await fetch(`/api/v1/couples/${coupleId}/dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: t("places.planTitle", { name: planPlace.name }),
        starts_at: new Date(planAt).toISOString(),
        place_label: `${planPlace.name} · ${planPlace.full_address}`,
        note: planNote || undefined,
      }),
    });
    if (!res.ok) {
      setPlanMsg(t("places.planFailed"));
      return;
    }
    setPlanMsg(t("places.planSaved"));
    setTimeout(() => {
      setPlanOpen(false);
      router.push("/couple/promises");
    }, 600);
  }

  const matchLabel = (cls: string) => {
    if (cls === "verified_match") return t("places.matchVerified");
    if (cls === "potential_match") return t("places.matchPotential");
    return t("places.matchInsufficient");
  };

  return (
    <div className="dm-page-frame space-y-5 pb-8">
      <header className="relative overflow-hidden rounded-dm-xl border border-dm-line bg-dm-surface shadow-dm">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(120deg, rgba(107,45,60,0.18), rgba(168,138,98,0.12), transparent 70%)",
          }}
        />
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
            {t("places.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-dm-ink sm:text-4xl">
            {t("places.v2HeroTitle")}
          </h1>
          <p className="mt-2 max-w-2xl font-editorial text-sm text-dm-muted sm:text-base">
            {t("places.v2HeroBody")}
          </p>
          <p className="mt-3 inline-flex rounded-full bg-dm-blush px-3 py-1 text-xs font-semibold text-dm-primary">
            {t("places.editorialBanner")}
          </p>
        </div>
      </header>

      <PlacesSubnav active="map" />

      {/* Search bar */}
      <section className="rounded-dm-xl border border-dm-line bg-dm-panel p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="text-xs font-semibold text-dm-muted">
            {t("places.filterCity")}
            <select
              className="mt-1 w-full rounded-xl border border-dm-line bg-white px-3 py-2.5 text-sm text-dm-ink"
              value={city}
              onChange={(e) => patchParams({ city: e.target.value })}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-dm-muted">
            {t("places.filterIntent")}
            <select
              className="mt-1 w-full rounded-xl border border-dm-line bg-white px-3 py-2.5 text-sm"
              value={intent}
              onChange={(e) => patchParams({ intent: e.target.value })}
            >
              <option value="first">{t("places.intentFirst")}</option>
              <option value="casual">{t("places.intentCasual")}</option>
              <option value="special">{t("places.intentSpecial")}</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-dm-muted">
            {t("places.filterBudget")}
            <select
              className="mt-1 w-full rounded-xl border border-dm-line bg-white px-3 py-2.5 text-sm"
              value={String(budgetMax)}
              onChange={(e) => patchParams({ budget: e.target.value })}
            >
              <option value="200000">≤ 200k / 2 người</option>
              <option value="500000">200–500k / 2 người</option>
              <option value="1000000">500k–1tr / 2 người</option>
              <option value="2000000">≤ 2tr / 2 người</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-dm-muted">
            {t("places.filterAtmosphere")}
            <select
              className="mt-1 w-full rounded-xl border border-dm-line bg-white px-3 py-2.5 text-sm"
              value={atmosphere}
              onChange={(e) => patchParams({ atm: e.target.value })}
            >
              <option value="quiet">{t("places.atmQuiet")}</option>
              <option value="lively">{t("places.atmLively")}</option>
              <option value="romantic">{t("places.atmRomantic")}</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-dm-muted sm:col-span-2 xl:col-span-1">
            {t("places.filterSearch")}
            <input
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder={t("places.searchPh")}
              className="mt-1 w-full rounded-xl border border-dm-line bg-white px-3 py-2.5 text-sm"
            />
          </label>
          <div className="flex items-end gap-2">
            <Button
              type="button"
              className="min-h-touch flex-1"
              onClick={() => patchParams({ q: draftQ || null })}
            >
              {t("places.searchCta")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-touch lg:hidden"
              onClick={() => setMobilePane("filters")}
            >
              {t("places.advancedFilters")}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-dm-muted">
            <input
              type="checkbox"
              checked={strict}
              onChange={(e) => patchParams({ strict: e.target.checked ? "1" : null })}
            />
            {t("places.strictBudget")}
          </label>
          <select
            className="rounded-full border border-dm-line bg-white px-3 py-1.5 text-xs"
            value={sort}
            onChange={(e) => patchParams({ sort: e.target.value })}
          >
            <option value="match">{t("places.sortMatch")}</option>
            <option value="rating">{t("places.sortRating")}</option>
            <option value="price">{t("places.sortPrice")}</option>
          </select>
        </div>
      </section>

      {/* Chips */}
      <div className="flex gap-2 overflow-x-auto dm-scroll-x pb-1">
        {CHIPS.map((chip) => {
          const active =
            chip.id === "all"
              ? category === "all" || (!outdoor && !parking && !photo && category === "all")
              : chip.cat
                ? category === chip.cat && !outdoor && !parking && !photo
                : chip.outdoor
                  ? outdoor
                  : chip.parking
                    ? parking
                    : photo;
          return (
            <button
              key={chip.id}
              type="button"
              className={cn(
                "min-h-touch shrink-0 rounded-full px-4 text-xs font-semibold",
                active ? "bg-dm-primary text-white" : "bg-dm-blush text-dm-primary",
              )}
              onClick={() => {
                if (chip.id === "all") {
                  patchParams({
                    cat: "all",
                    outdoor: null,
                    parking: null,
                    photo: null,
                  });
                } else if (chip.cat) {
                  patchParams({
                    cat: chip.cat,
                    outdoor: null,
                    parking: null,
                    photo: null,
                  });
                } else if (chip.outdoor) {
                  patchParams({ outdoor: outdoor ? null : "1", cat: null });
                } else if (chip.parking) {
                  patchParams({ parking: parking ? null : "1" });
                } else if (chip.photo) {
                  patchParams({ photo: photo ? null : "1" });
                }
              }}
            >
              {t(`places.chip.${chip.id}`)}
            </button>
          );
        })}
      </div>

      {/* Mobile pane switch */}
      <div className="flex gap-2 lg:hidden">
        {(["list", "map", "filters"] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={cn(
              "min-h-touch flex-1 rounded-full text-xs font-semibold",
              mobilePane === p ? "bg-dm-primary text-white" : "bg-dm-blush text-dm-primary",
            )}
            onClick={() => setMobilePane(p)}
          >
            {t(`places.pane.${p}`)}
          </button>
        ))}
      </div>

      {error ? <ErrorState title={t("common.error")} description={error} /> : null}

      <div
        className={cn(
          "grid min-h-[min(70dvh,720px)] gap-3",
          listCollapsed
            ? "lg:grid-cols-[48px_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(280px,40%)_minmax(0,60%)]",
        )}
      >
        {/* List */}
        <aside
          className={cn(
            "flex min-h-0 flex-col overflow-hidden rounded-dm-xl border border-dm-line bg-dm-surface shadow-dm",
            mobilePane !== "list" && mobilePane !== "filters" && "hidden lg:flex",
            mobilePane === "filters" && "lg:flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-dm-line px-3 py-2">
            <p className="text-xs font-semibold text-dm-muted">
              {loading ? t("common.loading") : t("places.listCount", { count: places.length })}
            </p>
            <button
              type="button"
              className="hidden text-xs font-semibold text-dm-primary lg:inline"
              onClick={() => setListCollapsed((v) => !v)}
            >
              {listCollapsed ? t("places.expandList") : t("places.collapseList")}
            </button>
          </div>
          {listCollapsed ? (
            <div className="hidden flex-1 lg:block" />
          ) : loading ? (
            <LoadingState className="m-4" />
          ) : places.length === 0 ? (
            <EmptyState
              className="m-4 border-0 shadow-none"
              title={t("places.noResults")}
              description={t("places.noResultsBody")}
            />
          ) : (
            <ul className="flex-1 space-y-2 overflow-y-auto p-2">
              {places.map((p) => {
                const active = p.id === selectedId || p.id === hoverId;
                return (
                  <li key={p.id}>
                    <article
                      className={cn(
                        "rounded-2xl border p-3 transition",
                        active
                          ? "border-dm-champagne bg-dm-blush/60"
                          : "border-dm-line bg-white hover:border-dm-primary/40",
                      )}
                      onMouseEnter={() => setHoverId(p.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          setSelectedId(p.id);
                          setMobilePane("map");
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-dm-ink">{p.name}</p>
                            <p className="mt-0.5 text-xs text-dm-muted">
                              {p.district} · {p.full_address}
                            </p>
                          </div>
                          <span className="rounded-full bg-dm-panel px-2 py-0.5 text-[10px] font-bold uppercase text-dm-champagne">
                            {matchLabel(p.dss.match_class)}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-dm-muted">{p.blurb}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-dm-muted">
                          {p.rating_mean != null ? (
                            <span>
                              ★ {p.rating_mean.toFixed(1)} ({p.rating_count})
                            </span>
                          ) : (
                            <span>{t("places.ratingUnverified")}</span>
                          )}
                          <span>{p.price_hint}</span>
                          {p.dss.score != null ? (
                            <span className="font-semibold text-dm-primary">
                              DSS {p.dss.score}
                            </span>
                          ) : null}
                        </div>
                        {p.tags?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-dm-blush px-2 py-0.5 text-[10px] text-dm-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </button>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/places/${p.id}`}>
                          <Button type="button" size="sm" variant="outline">
                            {t("common.viewDetails")}
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFav(p.id)}
                        >
                          {favs.includes(p.id) ? t("places.unsave") : t("places.save")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setPlanPlace(p);
                            setPlanOpen(true);
                            setPlanMsg(null);
                          }}
                        >
                          {t("places.planCta")}
                        </Button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Map */}
        <section
          className={cn(
            "relative min-h-[360px] overflow-hidden rounded-dm-xl border border-dm-line bg-dm-panel shadow-dm",
            mobilePane !== "map" && "hidden lg:block",
          )}
        >
          {mapVenues.length === 0 && !loading ? (
            <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-dm-muted">
              {t("places.mapEmpty")}
            </p>
          ) : (
            <DateMapLeaflet
              venues={mapVenues}
              selectedId={selectedId}
              onSelect={onSelectVenue}
              onHover={onHoverVenue}
            />
          )}
          <p className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] text-dm-muted">
            © OpenStreetMap
          </p>
        </section>
      </div>

      <Modal
        open={planOpen}
        title={t("places.planModalTitle")}
        onClose={() => setPlanOpen(false)}
      >
        {planPlace ? (
          <div className="space-y-3">
            <p className="text-sm text-dm-muted">
              {planPlace.name} — {t("places.planNotBooking")}
            </p>
            <label className="block text-xs font-semibold text-dm-muted">
              {t("places.planWhen")}
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl border border-dm-line px-3 py-2 text-sm"
                value={planAt}
                onChange={(e) => setPlanAt(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-dm-muted">
              {t("places.planNote")}
              <textarea
                className="mt-1 w-full rounded-xl border border-dm-line px-3 py-2 text-sm"
                rows={3}
                value={planNote}
                onChange={(e) => setPlanNote(e.target.value)}
              />
            </label>
            {planMsg ? <p className="text-sm text-dm-primary">{planMsg}</p> : null}
            <Button type="button" onClick={() => void submitPlan()}>
              {t("places.planSubmit")}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
