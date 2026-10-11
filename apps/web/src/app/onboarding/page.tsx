import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/" className="text-sm text-[var(--dm-deep)]/60">
        ← DeepMatch
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        Chào bạn
      </h1>
      <p className="mt-3 text-[var(--dm-deep)]/70">
        Xác nhận đủ 18 tuổi, đồng ý điều khoản, rồi chọn chế độ. Hồ sơ hẹn hò
        không bắt buộc nếu bạn vào Chúng mình bằng lời mời.
      </p>
      <form className="mt-8 space-y-4 rounded-3xl bg-white/70 p-6 shadow-sm">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" required className="mt-1" name="age" />
          Tôi xác nhận đủ 18 tuổi trở lên.
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" required className="mt-1" name="tos" />
          Tôi đồng ý Điều khoản & Chính sách quyền riêng tư.
        </label>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Chế độ</legend>
          <label className="flex gap-2 text-sm">
            <input type="radio" name="mode" value="solo" defaultChecked /> Độc
            thân / đang tìm hiểu
          </label>
          <label className="flex gap-2 text-sm">
            <input type="radio" name="mode" value="has_partner" /> Đã có người
            yêu — vào Chúng mình
          </label>
        </fieldset>
        <Link
          href="/me"
          className="inline-flex rounded-full bg-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Tiếp tục (UI scaffold)
        </Link>
      </form>
    </main>
  );
}
