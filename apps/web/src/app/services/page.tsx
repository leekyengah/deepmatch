import { flagEnabled } from "@/lib/flags";

export default function ServicesPage() {
  if (!flagEnabled("ff_concierge")) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl font-semibold">Đồng hành</h1>
        <p className="mt-3 text-sm opacity-70">
          Feature flag `ff_concierge` đang tắt (mặc định staging an toàn).
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-semibold">Đồng hành</h1>
      <p className="mt-3 text-sm">Danh mục dịch vụ & đặt lịch (enabled).</p>
    </main>
  );
}
