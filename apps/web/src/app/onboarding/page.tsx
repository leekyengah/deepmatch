import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveModeAction } from "./actions";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/" className="text-sm text-[var(--dm-deep)]/60">
        ← DeepMatch
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        Chọn chế độ
      </h1>
      <p className="mt-3 text-[var(--dm-deep)]/70">
        Hồ sơ hẹn hò không bắt buộc nếu bạn vào Chúng mình bằng lời mời.
      </p>
      <form action={saveModeAction} className="mt-8 space-y-4 rounded-3xl bg-white/70 p-6 shadow-sm">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Chế độ</legend>
          <label className="flex gap-2 text-sm">
            <input type="radio" name="mode" value="solo" defaultChecked /> Độc
            thân / đang tìm hiểu
          </label>
          <label className="flex gap-2 text-sm">
            <input type="radio" name="mode" value="has_partner" /> Đã có người yêu
            — vào Chúng mình
          </label>
        </fieldset>
        <button
          type="submit"
          className="inline-flex rounded-full bg-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Tiếp tục
        </button>
      </form>
    </main>
  );
}
