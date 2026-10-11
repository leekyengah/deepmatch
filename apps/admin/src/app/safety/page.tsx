export default function SafetyPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold">Chat safety & reports</h1>
      <p className="mt-3 text-sm opacity-70">
        Report inbox, moderation actions, appeals. Evidence access chỉ qua
        break-glass có audit (ADR-07). Queue UI scaffold — chưa production.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed p-6 text-sm">
        Open reports: 0 (no live DB connected in local scaffold)
      </div>
    </main>
  );
}
