/** AI Gateway types + stub adapter (EXT-006). No clinical claims; no auto-send. */

import { DEFAULT_LOCALE, resolveLocale, t, type Locale } from "@deepmatch/i18n";

export type AiTask =
  | "profile_coach"
  | "match_hints"
  | "style"
  | "beauty"
  | "gift"
  | "date_plan"
  | "travel"
  | "story"
  | "safety_tips"
  | "deepmind";

export type AiAdapterName = "stub" | "openai";

export type AiAssistRequest = {
  task: AiTask;
  input?: Record<string, unknown>;
};

export type AiSuggestion = { title: string; body: string; demo?: boolean };

export type AiAssistResponse = {
  adapter: AiAdapterName;
  task: AiTask;
  disclaimer: string;
  suggestions: AiSuggestion[];
  catalogHints?: string[];
  fallbackFrom?: AiAdapterName;
};

export function getAiDisclaimer(locale: Locale = DEFAULT_LOCALE): string {
  return t(locale, "ai.disclaimer");
}

/** @deprecated Prefer getAiDisclaimer(locale). Kept for backward-compatible imports. */
export const AI_DISCLAIMER = getAiDisclaimer("vi-VN");

/** DECISION-AI-01 C: stub default; openai only when AI_ADAPTER=openai (+ key). */
export function resolveAiAdapter(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): AiAdapterName {
  const raw = (env.AI_ADAPTER ?? "stub").trim().toLowerCase();
  if (raw === "openai") return "openai";
  return "stub";
}

export function redactedInput(
  input: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!input) return {};
  const blocked = ["journal", "private_note", "raw_chat", "password", "token"];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (blocked.some((b) => k.toLowerCase().includes(b))) continue;
    if (typeof v === "string" && v.length > 2000) {
      out[k] = `${v.slice(0, 2000)}…`;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function localeFromInput(input: Record<string, unknown>): Locale {
  return resolveLocale(
    typeof input.locale === "string" ? input.locale : DEFAULT_LOCALE,
  );
}

export function stubAssist(
  task: AiTask,
  input: Record<string, unknown> = {},
): AiAssistResponse {
  const locale = localeFromInput(input);
  const occasion = String(
    input.occasion ?? (locale === "en-US" ? "a date" : "buổi hẹn"),
  );
  const budget = String(
    input.budget ?? (locale === "en-US" ? "moderate" : "vừa phải"),
  );

  const templates: Record<AiTask, AiSuggestion[]> = {
    profile_coach: [
      {
        title: t(locale, "ai.stubProfileDraft"),
        body: t(locale, "ai.stubProfileBody"),
      },
      {
        title: t(locale, "ai.stubProfileNoteTitle"),
        body: t(locale, "ai.stubProfileNoteBody"),
      },
    ],
    match_hints: [
      {
        title: t(locale, "ai.stubMatchHintsTitle"),
        body: t(locale, "ai.stubMatchHintsBody"),
      },
    ],
    style: [
      {
        title:
          locale === "en-US"
            ? `Style ideas for ${occasion}`
            : `Phong cách cho ${occasion}`,
        body:
          locale === "en-US"
            ? `Prefer neutral layers, budget ${budget}. See Fashion DEMO in Lifestyle.`
            : `Ưu tiên lớp trung tính, ngân sách ${budget}. Xem mục Thời trang DEMO trong Lifestyle.`,
        demo: true,
      },
    ],
    beauty: [
      {
        title:
          locale === "en-US" ? "Light look for a date" : "Look nhẹ cho buổi hẹn",
        body:
          locale === "en-US"
            ? "Prefer a sheer base and natural lip color. Not medical advice; patch-test if sensitive."
            : "Ưu tiên lớp nền mỏng + son tự nhiên. Đây không phải tư vấn y khoa; làm patch-test nếu da nhạy.",
        demo: true,
      },
    ],
    gift: [
      {
        title: locale === "en-US" ? "DEMO gift ideas" : "Gợi ý quà DEMO",
        body:
          locale === "en-US"
            ? `For ${occasion}, budget ${budget}: see Seasonal flowers / Tea & treats (SANDBOX_ONLY).`
            : `Dịp ${occasion}, ngân sách ${budget}: xem Hoa theo dịp / Hộp trà và bánh (SANDBOX_ONLY).`,
        demo: true,
      },
    ],
    date_plan: [
      {
        title: t(locale, "ai.stubDatePlanTitle"),
        body: t(locale, "ai.stubDatePlanBody"),
        demo: true,
      },
    ],
    travel: [
      {
        title: locale === "en-US" ? "Trip ideas" : "Ý tưởng chuyến đi",
        body:
          locale === "en-US"
            ? "A one-night staycation or weekend city walk (DEMO). No real tickets or rooms."
            : "Staycation 1 đêm hoặc City walk cuối tuần (DEMO). Không có vé/phòng thật.",
        demo: true,
      },
    ],
    story: [
      {
        title: locale === "en-US" ? "Memory draft" : "Nháp kỷ niệm",
        body:
          locale === "en-US"
            ? "Use only moments you choose and both agreed to share. Private journals are not read by default."
            : "Chỉ dùng khoảnh khắc bạn chọn và đã đồng ý hai phía. Không đọc nhật ký riêng mặc định.",
      },
    ],
    safety_tips: [
      {
        title:
          locale === "en-US"
            ? "Basic safety (free)"
            : "An toàn cơ bản (miễn phí)",
        body:
          locale === "en-US"
            ? "Share plans with someone you trust, meet in public, use timed check-ins. Not emergency dispatch."
            : "Chia sẻ lịch trình với người tin cậy, hẹn nơi công cộng, check-in theo cửa sổ thời gian. Không phải dịch vụ khẩn cấp / điều phối thật.",
      },
    ],
    deepmind: [
      {
        title: t(locale, "ai.selfReflection"),
        body:
          locale === "en-US"
            ? "Which value matters most to you this week? Only you can edit or delete the answer — this is not a clinical personality label."
            : "Bạn đang tìm sự đồng điệu về giá trị nào nhất tuần này? Câu trả lời chỉ bạn chỉnh sửa/xóa được — không phải nhãn tính cách lâm sàng.",
      },
    ],
  };

  return {
    adapter: "stub",
    task,
    disclaimer: getAiDisclaimer(locale),
    suggestions: templates[task],
    catalogHints:
      task === "gift" ||
      task === "style" ||
      task === "beauty" ||
      task === "date_plan"
        ? ["/lifestyle"]
        : undefined,
  };
}

export function catalogHintsFor(task: AiTask): string[] | undefined {
  if (
    task === "gift" ||
    task === "style" ||
    task === "beauty" ||
    task === "date_plan" ||
    task === "travel"
  ) {
    return ["/lifestyle"];
  }
  return undefined;
}

export function systemPromptFor(
  task: AiTask,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const lang = locale === "en-US" ? "English" : "Vietnamese";
  return [
    `You are DeepMatch AI assist. Reply in ${lang}.`,
    'Return ONLY valid JSON: {"suggestions":[{"title":"...","body":"...","demo":true|false}]}',
    "2-4 suggestions. No medical/mental diagnosis. No auto-send chat. No invented real bookings/prices as live.",
    "Do not claim mind-reading, guaranteed compatibility, or create purchase urgency.",
    "Mark demo:true when referring to catalog sandbox items.",
    `Task: ${task}`,
    getAiDisclaimer(locale),
  ].join("\n");
}
