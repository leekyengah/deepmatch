import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProfileAction } from "./actions";

export default async function MeEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, fuzzy_region, job_title")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-semibold">Chỉnh sửa hồ sơ</h1>
      <form action={saveProfileAction} className="mt-6 space-y-4 rounded-3xl bg-white/80 p-6">
        <label className="block text-sm">
          Tên hiển thị
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Giới thiệu
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
          />
        </label>
        <label className="block text-sm">
          Khu vực (fuzzy, không GPS chính xác)
          <input
            name="fuzzy_region"
            defaultValue={profile?.fuzzy_region ?? ""}
            placeholder="VD: HN, HCM"
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Nghề nghiệp (tuỳ chọn)
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
          Lưu
        </button>
      </form>
    </main>
  );
}
