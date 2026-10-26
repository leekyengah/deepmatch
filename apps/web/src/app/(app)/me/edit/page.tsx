import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { AvatarUpload } from "@/components/me/AvatarUpload";
import { saveProfileAction } from "./actions";

export default async function MeEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = await getServerTranslator();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, fuzzy_region, job_title, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-semibold">{t("profile.edit")}</h1>
      <div className="mt-6">
        <AvatarUpload currentPath={profile?.avatar_path ?? null} />
      </div>
      <form action={saveProfileAction} className="mt-4 space-y-4 rounded-3xl bg-white/80 p-6">
        <label className="block text-sm">
          {t("profile.displayName")}
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("profile.bio")}
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
          />
        </label>
        <label className="block text-sm">
          {t("profile.fuzzyRegion")}
          <input
            name="fuzzy_region"
            defaultValue={profile?.fuzzy_region ?? ""}
            placeholder={t("profile.fuzzyPlaceholder")}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("profile.jobTitle")}
          <input
            name="job_title"
            defaultValue={profile?.job_title ?? ""}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {t("profile.save")}
        </button>
      </form>
    </main>
  );
}
