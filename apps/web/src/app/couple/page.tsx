import Link from "next/link";

const tabs = [
  ["Bản đồ", "/couple/map"],
  ["Kỷ niệm", "/couple/memories"],
  ["Thêm mới", "/couple/add"],
  ["Hẹn ước", "/couple/promises"],
  ["Hai đứa", "/couple/us"],
];

export default function CoupleHomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        Chúng mình
      </h1>
      <p className="mt-2 text-sm opacity-70">
        Không gian cặp đôi chỉ sau lời mời + đồng ý hai phía. Mutual like không
        tự tạo pair.
      </p>
      <Link
        href="/couple/invite"
        className="mt-6 inline-flex rounded-full bg-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Lời mời / ghép cặp
      </Link>
      <div className="mt-8 grid gap-3">
        {tabs.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[var(--dm-blush)] bg-white/70 px-4 py-4 font-medium"
          >
            {label}
          </Link>
        ))}
      </div>
      <p className="mt-8 rounded-2xl bg-white/60 p-4 text-sm">
        Empty state: tạo ghim kỷ niệm đầu tiên trên Bản đồ.
      </p>
    </main>
  );
}
