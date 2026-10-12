import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveHomeState } from "@/lib/home-state";
import { getServerTranslator } from "@/lib/i18n/server";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function PersonaHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/home");

  const { t } = await getServerTranslator();
  const home = await resolveHomeState(user.id);
  const lifestyleOn = await flagEnabled("ff_lifestyle");
  const aiOn = await flagEnabled("ff_ai");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, discovery_opt_in, fuzzy_region")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.display_name?.trim() || t("errors.memberDefault");

  const tiles: Array<{ href: string; title: string; body: string }> = [];

  if (home.state === "onboarding") {
    tiles.push({
      href: "/onboarding",
      title: t("home.tileOnboarding"),
      body: t("home.tileOnboardingBody"),
    });
  }
  if (home.state === "dating" || home.state === "matched" || home.state === "couple") {
    tiles.push({
      href: "/discover",
      title: t("home.tileDiscover"),
      body: t("home.tileDiscoverBody"),
    });
  }
  if (home.hasMutualMatch) {
    tiles.push({
      href: "/chat",
      title: t("home.tileChat"),
      body: t("home.tileChatBody"),
    });
  }
  tiles.push({
    href: home.coupleId ? "/couple" : "/couple/invite",
    title: t("home.tileCouple"),
    body: home.coupleId
      ? t("home.tileCoupleActive")
      : t("home.tileCoupleInvite"),
  });
  if (lifestyleOn) {
    tiles.push({
      href: "/lifestyle",
      title: t("home.tileLifestyle"),
      body: t("home.tileLifestyleBody"),
    });
  }
  if (aiOn) {
    tiles.push({
      href: "/ai",
      title: t("home.tileAi"),
      body: t("home.tileAiBody"),
    });
  }
  tiles.push({
    href: "/safe",
    title: t("home.tileSafe"),
    body: t("home.tileSafeBody"),
  });
  tiles.push({
    href: "/me/edit",
    title: t("home.tileProfile"),
    body: profile?.discovery_opt_in
      ? t("home.tileProfileReady")
      : t("home.tileProfileIncomplete"),
  });

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        {t("home.eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        {t("home.greeting", { name })}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("home.intro")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="default">{home.state}</Badge>
        {profile?.fuzzy_region ? (
          <Badge tone="good">{profile.fuzzy_region}</Badge>
        ) : null}
        {lifestyleOn ? <Badge tone="warn">DEMO Lifestyle</Badge> : null}
      </div>

      <div className="mt-6">
        <Link href={home.redirectTo === "/home" ? "/discover" : home.redirectTo}>
          <Button type="button">{t("home.primaryCta")}</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <Link key={tile.href + tile.title} href={tile.href}>
            <Card className="h-full transition hover:border-dm-primary">
              <p className="font-semibold text-dm-raspberry">{tile.title}</p>
              <p className="mt-1 text-sm text-dm-muted">{tile.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
