import Link from "next/link";

const modules = [
  ["Người dùng", "/users"],
  ["Duyệt profile/ảnh", "/moderation"],
  ["Matching ops", "/matching"],
  ["Chat safety", "/safety"],
  ["Dịch vụ / advisor", "/services"],
  ["CMS", "/cms"],
  ["Analytics", "/analytics"],
  ["Feature flags", "/flags"],
];

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-sm font-semibold tracking-wide text-[var(--dm-primary)]">
        DEEPMATCH ADMIN
      </p>
      <h1 className="mt-2 text-3xl font-bold">Bảng điều hành</h1>
      <p className="mt-2 max-w-2xl text-sm opacity-70">
        RBAC least privilege · audit mọi hành động nhạy cảm · không duyệt
        chat/journal mặc định. Aggregates không chứa PII.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {modules.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[var(--dm-blush)] bg-white/80 px-4 py-5 text-sm font-semibold shadow-sm"
          >
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
