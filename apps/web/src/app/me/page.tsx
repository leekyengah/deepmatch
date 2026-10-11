import Link from "next/link";

export default function MePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        Bảng cá nhân
      </h1>
      <p className="mt-2 text-sm text-[var(--dm-deep)]/70">
        Hồ sơ, quyền riêng tư, phiên thiết bị và lịch sử kết nối (scaffold UI).
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Chỉnh sửa hồ sơ", "/me/edit"],
          ["Hồ sơ chiều sâu", "/me/deep"],
          ["Quyền riêng tư", "/me/privacy"],
          ["Tài khoản & thiết bị", "/me/account"],
          ["Lịch sử kết nối", "/me/history"],
          ["Tìm nhau", "/discover"],
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
    </main>
  );
}
