export default function CoupleMapPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Bản đồ</h1>
      <p className="mt-2 text-sm opacity-70">
        Mapbox integration (ADR-08). Chọn vị trí thủ công nếu từ chối GPS. Không
        tracking ngầm.
      </p>
      <div className="mt-8 flex h-80 items-center justify-center rounded-3xl border border-dashed border-[var(--dm-deep)]/30 bg-white/50 text-sm">
        Map canvas placeholder — requires NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
      <ul className="mt-6 space-y-2 text-sm">
        <li>Đã cùng đến</li>
        <li>Muốn cùng đến</li>
        <li>Dấu mốc</li>
      </ul>
    </main>
  );
}
