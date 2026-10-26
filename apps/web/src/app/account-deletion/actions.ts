"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/route";
import { getServerTranslator } from "@/lib/i18n/server";

export async function deleteAccountAction(formData: FormData) {
  const { t } = await getServerTranslator();
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") {
    redirect("/account-deletion?error=confirm");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account-deletion");

  const admin = createServiceClient();
  const now = new Date().toISOString();
  await admin
    .from("profiles")
    .update({
      display_name: t("auth.deletedDisplayName"),
      bio: null,
      avatar_path: null,
      job_title: null,
      fuzzy_region: null,
      discovery_opt_in: false,
      hidden_from_discovery: true,
      suspended: true,
      updated_at: now,
    })
    .eq("id", user.id);

  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
