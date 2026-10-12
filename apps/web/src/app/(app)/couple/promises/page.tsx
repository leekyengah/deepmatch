import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CouplePromisesPage() {
  const { t } = await getServerTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const coupleId = await getActiveCoupleId(user.id);

  const { data: pins } = coupleId
    ? await supabase
        .from("pins")
        .select("id, title, note, place_label, created_at")
        .eq("pair_id", coupleId)
        .eq("layer", "wishlist")
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("couple.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("couple.promisesHeading")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("couple.promisesIntro")}
      </p>

      {!coupleId ? (
        <div className="mt-8">
          <EmptyState
            title={t("couple.emptySpaceTitle")}
            action={
              <Link href="/couple/invite">
                <Button type="button" size="sm">
                  {t("memories.inviteCta")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : !pins?.length ? (
        <div className="mt-8">
          <EmptyState
            title={t("couple.promisesEmptyTitle")}
            description={t("couple.promisesEmptyBody")}
            action={
              <Link href="/couple/add">
                <Button type="button" size="sm">
                  {t("couple.promisesAddCta")}
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {pins.map((p) => (
            <li key={p.id}>
              <Card>
                <h2 className="font-semibold text-dm-raspberry">{p.title}</h2>
                {p.place_label || p.note ? (
                  <p className="mt-1 text-sm text-dm-muted">
                    {p.place_label ?? p.note}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
