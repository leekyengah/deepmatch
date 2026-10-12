import bank from "./question-bank-vi.json";

export type NeedsQuestion = {
  id: string;
  group: string;
  promptVi: string;
  answerType: string;
  branch: string;
  privacy: string;
  specStatus: string;
  implStatus: string;
  note?: string;
};

export const NEEDS_QUESTION_BANK_VI = bank as NeedsQuestion[];
export const NEEDS_QUESTION_COUNT = NEEDS_QUESTION_BANK_VI.length;

/** QX-01: 6 chung + 1 mode (resolved from C01). */
export const NEEDS_ONBOARDING_COMMON_IDS = [
  "C01",
  "C02",
  "C03",
  "C04",
  "C05",
  "C15",
] as const;

export const NEEDS_ONBOARDING_MODE_BY_C01: Record<string, string> = {
  "kết bạn": "F01",
  "hẹn hò": "D01",
  "hướng đến hôn nhân": "M01",
};

export function needsQuestionById(id: string): NeedsQuestion | undefined {
  return NEEDS_QUESTION_BANK_VI.find((q) => q.id === id);
}

export function resolveOnboardingModeQuestionId(
  c01Answer: string | undefined | null,
): string | null {
  if (!c01Answer) return null;
  const key = c01Answer.trim().toLowerCase();
  for (const [label, qid] of Object.entries(NEEDS_ONBOARDING_MODE_BY_C01)) {
    if (key.includes(label)) return qid;
  }
  return null;
}

export function buildOnboardingQuestionSet(
  c01Answer?: string | null,
): NeedsQuestion[] {
  const common = NEEDS_ONBOARDING_COMMON_IDS.map((id) => needsQuestionById(id)).filter(
    (q): q is NeedsQuestion => Boolean(q),
  );
  const modeId = resolveOnboardingModeQuestionId(c01Answer);
  const modeQ = modeId ? needsQuestionById(modeId) : undefined;
  return modeQ ? [...common, modeQ] : common;
}
