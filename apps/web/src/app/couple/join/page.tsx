import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CoupleJoinClient } from "@/components/couple/CoupleJoinClient";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CoupleJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const { t } = await getServerTranslator();
  const inviteCode = code?.trim() ?? "";

  if (!inviteCode) {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-6 py-12">
        <Link href="/" aria-label={t("nav.homeAria")}>
          <BrandLogo variant="full" className="h-9 w-auto" />
        </Link>
        <h1 className="mt-10 font-display text-3xl text-dm-raspberry">
          {t("couple.joinMissingCode")}
        </h1>
        <p className="mt-3 text-sm text-dm-muted">{t("couple.joinMissingHint")}</p>
        <Link href="/login" className="mt-8 inline-block">
          <Button type="button">{t("auth.login")}</Button>
        </Link>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = `/couple/join?code=${encodeURIComponent(inviteCode)}`;

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-6 py-12">
        <Link href="/" aria-label={t("nav.homeAria")}>
          <BrandLogo variant="full" className="h-9 w-auto" />
        </Link>
        <p className="mt-10 text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
          {t("couple.title")}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
          {t("couple.joinHeading")}
        </h1>
        <p className="mt-3 text-sm text-dm-muted">{t("couple.joinGuestIntro")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/signup?next=${encodeURIComponent(next)}`}>
            <Button type="button">{t("couple.joinSignup")}</Button>
          </Link>
          <Link href={`/login?next=${encodeURIComponent(next)}`}>
            <Button type="button" variant="outline">
              {t("couple.joinLogin")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Authenticated: client accepts invite then redirects into couple space
  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-12">
      <Link href="/" aria-label={t("nav.homeAria")}>
        <BrandLogo variant="full" className="h-9 w-auto" />
      </Link>
      <h1 className="mt-10 font-display text-3xl text-dm-raspberry">
        {t("couple.joinAccepting")}
      </h1>
      <CoupleJoinClient code={inviteCode} />
    </main>
  );
}
