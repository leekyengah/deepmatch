import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { MediaGateClient } from "@/components/me/MediaGateClient";

export default async function MediaLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/media");
  const { t } = await getServerTranslator();

  return (
    <main className="dm-page-frame dm-page-frame--narrow pb-16">
      <Link href="/me" className="text-sm text-dm-muted underline">
        {t("needs.backMe")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-dm-ink">
        {t("profile.mediaGateTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("profile.mediaGateIntro")}</p>
      <div className="mt-6">
        <MediaGateClient />
      </div>
    </main>
  );
}
