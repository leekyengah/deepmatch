import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CoupleMemoriesPage() {
  const { t } = await getServerTranslator();
  const layerLabel: Record<string, string> = {
    visited: t("couple.layerVisited"),
    wishlist: t("couple.layerWishlist"),
    milestone: t("couple.layerMilestone"),
  };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const coupleId = await getActiveCoupleId(user.id);

  const { data: pins } = coupleId
    ? await supabase
        .from("pins")
        .select("id, layer, title, note, place_label, visited_on, created_at")
        .eq("pair_id", coupleId)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  const featured = pins?.[0] ?? null;
  const rest = pins?.slice(1) ?? [];

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-dm-ink">
        {t("memories.momentsHeading")}
      </h1>
      <p className="mt-2 font-editorial text-sm text-dm-muted">
        {t("memories.pageIntro")}
      </p>

      {!coupleId ? (
        <div className="mt-8">
          <EmptyState
            title={t("memories.emptySpaceTitle")}
            description={t("memories.emptySpaceBody")}
            action={
              <Link href="/couple/invite">
                <Button type="button" size="sm">
                  {t("memories.inviteCta")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : !pins?.length || !featured ? (
        <div className="mt-8">
          <EmptyState
            title={t("memories.emptyTitle")}
            description={t("memories.emptyTimelineBody")}
            action={
              <Link href="/couple/add">
                <Button type="button" size="sm">
                  {t("memories.addCta")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* COUPLE-02 featured moment */}
          <article className="overflow-hidden rounded-[22px] border border-dm-line bg-dm-panel shadow-dm">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-dm-deep via-[#5a3340] to-dm-blush">
              <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between">
                  <Badge tone="default">{t("memories.privateBadge")}</Badge>
                  <span className="rounded-full bg-black/25 px-2 py-1 text-xs">
                    1/{pins.length}
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-3xl font-semibold">
                    {featured.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/85">
                    {[featured.place_label, featured.visited_on]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="warn">
                  {layerLabel[featured.layer] ?? featured.layer}
                </Badge>
                <span className="text-xs text-dm-muted">
                  {t("memories.privateHint")}
                </span>
              </div>
              {featured.note ? (
                <p className="font-editorial text-sm leading-relaxed text-dm-ink">
                  {featured.note}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/couple/add">
                  <Button type="button" size="sm" variant="outline">
                    {t("memories.addPhoto")}
                  </Button>
                </Link>
                <Link href="/couple/add">
                  <Button type="button" size="sm" variant="secondary">
                    {t("memories.addVideo")}
                  </Button>
                </Link>
                <Link href="/couple/map">
                  <Button type="button" size="sm" variant="ghost">
                    {t("couple.navMap")}
                  </Button>
                </Link>
              </div>
            </div>
          </article>

          {rest.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {rest.map((p, idx) => (
                <li key={p.id}>
                  <article className="h-full rounded-[16px] border border-dm-line bg-dm-surface p-4">
                    <p className="text-xs font-bold text-dm-champagne">
                      {layerLabel[p.layer] ?? p.layer}
                      {p.visited_on ? ` · ${p.visited_on}` : ""}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-dm-ink">
                      {p.title}
                    </h3>
                    {p.place_label ? (
                      <p className="text-sm text-dm-muted">{p.place_label}</p>
                    ) : null}
                    {p.note ? (
                      <p className="mt-2 line-clamp-3 text-sm text-dm-ink">
                        {p.note}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[11px] text-dm-muted">
                      {idx + 2}/{pins.length}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
