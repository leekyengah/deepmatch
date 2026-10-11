import { rankCandidates, type DiscoveryProfile, type MatchPreferences } from "@deepmatch/shared";
import { flagEnabled } from "@/lib/flags";

const demoViewer: DiscoveryProfile = {
  userId: "viewer",
  displayName: "Bạn",
  birthDate: "1996-05-01",
  fuzzyRegion: "HN",
  goals: ["long_term"],
  values: ["kindness"],
  interests: ["coffee", "travel"],
  dealbreakers: [],
  discoveryOptIn: true,
  hiddenFromDiscovery: false,
};

const demoPrefs: MatchPreferences = {
  userId: "viewer",
  minAge: 21,
  maxAge: 40,
  regions: ["HN"],
  requiredGoals: ["long_term"],
  excludedUserIds: [],
};

const demoPool: DiscoveryProfile[] = [
  {
    ...demoViewer,
    userId: "c1",
    displayName: "Lan",
    interests: ["coffee", "books"],
    values: ["kindness", "growth"],
  },
  {
    ...demoViewer,
    userId: "c2",
    displayName: "Khoa",
    interests: ["travel"],
    values: ["honesty"],
  },
];

export default function DiscoverPage() {
  if (!flagEnabled("ff_discovery") || !flagEnabled("ff_matching")) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-2xl font-semibold">Tìm nhau đang tắt</h1>
        <p className="mt-2 text-sm opacity-70">Kill switch / feature flag.</p>
      </main>
    );
  }

  const ranked = rankCandidates(demoPrefs, demoViewer, demoPool);

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        Tìm nhau
      </h1>
      <p className="mt-2 text-sm text-[var(--dm-deep)]/70">
        Gợi ý rule-based (demo local). Không phải xác suất yêu. Mutual like không
        tạo không gian Chúng mình.
      </p>
      <ul className="mt-8 space-y-4">
        {ranked.map((c) => {
          const profile = demoPool.find((p) => p.userId === c.userId)!;
          return (
            <li
              key={c.userId}
              className="rounded-3xl border border-[var(--dm-blush)] bg-white/80 p-5"
            >
              <p className="text-lg font-semibold">{profile.displayName}</p>
              <p className="text-sm opacity-70">{profile.fuzzyRegion}</p>
              <ul className="mt-3 list-disc pl-5 text-sm">
                {c.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-[var(--dm-primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Thích
                </button>
                <button
                  type="button"
                  className="rounded-full border px-4 py-2 text-sm"
                >
                  Bỏ qua
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
