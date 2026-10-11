import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/logout/actions";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, mode, discovery_opt_in, fuzzy_region")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
            Bảng cá nhân
          </h1>
          <p className="mt-2 text-sm text-[var(--dm-deep)]/70">
            {profile?.display_name ?? user.email} · chế độ{" "}
            {profile?.mode ?? "solo"}
            {profile?.fuzzy_region ? ` · ${profile.fuzzy_region}` : ""}
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline opacity-70">
            Đăng xuất
          </button>
        </form>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Chỉnh sửa hồ sơ", "/me/edit"],
          ["Quyền riêng tư", "/me/privacy"],
          ["Tìm nhau", "/discover"],
          ["Chat", "/chat"],
          ["Chúng mình", "/couple"],
          ["Đồng hành", "/services"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[var(--dm-blush)] bg-white/70 px-4 py-5 text-sm font-semibold"
          >
            {label}
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs opacity-50">
        Discovery opt-in: {profile?.discovery_opt_in ? "bật" : "tắt"}
      </p>
    </main>
  );
}
