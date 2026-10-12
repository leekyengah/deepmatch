/** AI Gateway types + stub adapter (EXT-006). No clinical claims; no auto-send. */

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

export const AI_DISCLAIMER =
  "Gợi ý mang tính tham khảo. Không phải chẩn đoán y khoa/tâm lý. Không tự gửi tin nhắn. Mục catalog gắn DEMO không phải giao dịch thật.";

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

export function stubAssist(
  task: AiTask,
  input: Record<string, unknown> = {},
): AiAssistResponse {
  const occasion = String(input.occasion ?? "buổi hẹn");
  const budget = String(input.budget ?? "vừa phải");

  const templates: Record<AiTask, AiSuggestion[]> = {
    profile_coach: [
      {
        title: "Bản nháp bio",
        body: "Mình thích trò chuyện sâu, cà phê chậm và khám phá góc phố yên. Đang tìm người cùng tôn trọng ranh giới và lịch trình.",
      },
      {
        title: "Lưu ý",
        body: "Chỉ lưu khi bạn bấm duyệt — AI không tự đăng hồ sơ.",
      },
    ],
    match_hints: [
      {
        title: "Điểm chung có thể hỏi",
        body: "Hỏi về sở thích đã hiển thị công khai (ví dụ ẩm thực / dạo phố), tránh đoán cảm xúc riêng tư.",
      },
    ],
    style: [
      {
        title: `Phong cách cho ${occasion}`,
        body: `Ưu tiên lớp trung tính, ngân sách ${budget}. Xem mục Thời trang DEMO trong Lifestyle.`,
        demo: true,
      },
    ],
    beauty: [
      {
        title: "Look nhẹ cho buổi hẹn",
        body: "Ưu tiên lớp nền mỏng + son tự nhiên. Đây không phải tư vấn y khoa; làm patch-test nếu da nhạy.",
        demo: true,
      },
    ],
    gift: [
      {
        title: "Gợi ý quà DEMO",
        body: `Dịp ${occasion}, ngân sách ${budget}: xem Hoa theo dịp / Hộp trà và bánh (SANDBOX_ONLY).`,
        demo: true,
      },
    ],
    date_plan: [
      {
        title: "Kế hoạch mẫu",
        body: "Café yên tĩnh → dạo ngắn → trà chiều. Giờ/giá/chỗ trống là DEMO — chưa đặt chỗ thật.",
        demo: true,
      },
    ],
    travel: [
      {
        title: "Ý tưởng chuyến đi",
        body: "Staycation 1 đêm hoặc City walk cuối tuần (DEMO). Không có vé/phòng thật.",
        demo: true,
      },
    ],
    story: [
      {
        title: "Nháp kỷ niệm",
        body: "Chỉ dùng khoảnh khắc bạn chọn và đã đồng ý hai phía. Không đọc nhật ký riêng mặc định.",
      },
    ],
    safety_tips: [
      {
        title: "An toàn cơ bản (miễn phí)",
        body: "Chia sẻ lịch trình với người tin cậy, hẹn nơi công cộng, check-in theo cửa sổ thời gian. Không phải dịch vụ khẩn cấp / điều phối thật.",
      },
    ],
    deepmind: [
      {
        title: "Tự phản ánh",
        body: "Bạn đang tìm sự đồng điệu về giá trị nào nhất tuần này? Câu trả lời chỉ bạn chỉnh sửa/xóa được — không phải nhãn tính cách lâm sàng.",
      },
    ],
  };

  return {
    adapter: "stub",
    task,
    disclaimer: AI_DISCLAIMER,
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

export function systemPromptFor(task: AiTask): string {
  return [
    "You are DeepMatch AI assist. Reply in Vietnamese.",
    "Return ONLY valid JSON: {\"suggestions\":[{\"title\":\"...\",\"body\":\"...\",\"demo\":true|false}]}",
    "2-4 suggestions. No medical/mental diagnosis. No auto-send chat. No invented real bookings/prices as live.",
    "Mark demo:true when referring to catalog sandbox items.",
    `Task: ${task}`,
    AI_DISCLAIMER,
  ].join("\n");
}
