import { defaultFlags } from "@deepmatch/shared";

export default function FlagsPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold">Feature flags / kill switches</h1>
      <p className="mt-2 text-sm opacity-70">
        DB `feature_flags` là nguồn sự thật staging/prod. Giá trị dưới là default
        local.
      </p>
      <ul className="mt-6 space-y-2">
        {Object.entries(defaultFlags).map(([k, v]) => (
          <li
            key={k}
            className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm"
          >
            <span>{k}</span>
            <span className="font-semibold">{v ? "ON" : "OFF"}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
