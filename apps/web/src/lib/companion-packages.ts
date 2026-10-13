/** Master tab32 — 7 companion packages (display catalog). No LIVE PSP. */

export type CompanionNeedTag =
  | "listen"
  | "experience"
  | "goals"
  | "private"
  | "match"
  | "life_partner"
  | "exclusive";

/** 0=none, 1=basic, 2=full, 3=very full — for compare matrix (product UX). */
export type CompareLevel = 0 | 1 | 2 | 3;

export type CompanionPackage = {
  code: string;
  group: "companion" | "matchmaking";
  slug: string;
  titleVi: string;
  titleEn: string;
  listPriceVnd: number;
  salePriceVnd: number;
  durationVi: string;
  durationEn: string;
  suitableVi: string;
  suitableEn: string;
  benefitsVi: string;
  benefitsEn: string;
  processVi: string;
  processEn: string;
  usageVi: string;
  usageEn: string;
  limitsVi: string;
  limitsEn: string;
  needTags: CompanionNeedTag[];
  image: string;
  compare: {
    duration: CompareLevel;
    format: CompareLevel;
    personalization: CompareLevel;
    coordination: CompareLevel;
    dualSupport: CompareLevel;
  };
};

export const COMPANION_PACKAGES: CompanionPackage[] = [
  {
    code: "CMP-01",
    group: "companion",
    slug: "lang-nghe",
    titleVi: "Lắng nghe",
    titleEn: "Listening session",
    listPriceVnd: 598_000,
    salePriceVnd: 498_000,
    durationVi: "1 buổi × 45 phút",
    durationEn: "1 session × 45 minutes",
    suitableVi: "Người muốn chia sẻ chuyện đời sống/công việc/cảm xúc.",
    suitableEn: "People who want to share life, work, or emotional topics.",
    benefitsVi:
      "Chọn người; chọn chủ đề; gọi thoại/video; lời nhắn trước buổi; đánh giá sau buổi.",
    benefitsEn:
      "Choose a provider; pick a topic; voice/video call; pre-session note; post-session feedback.",
    processVi:
      "Chọn gói → xem hồ sơ và lịch → gửi nhu cầu → người cung cấp xác nhận → thanh toán → tham gia gọi → phản hồi.",
    processEn:
      "Choose package → review profile/calendar → send needs → provider confirms → pay → join call → feedback.",
    usageVi:
      "Vào lịch hẹn trong tài khoản; kiểm tra mic/camera; tham gia đúng giờ. Liên hệ chỉ trong buổi đã đặt.",
    usageEn:
      "Open your booking; check mic/camera; join on time. Contact only within the booked session.",
    limitsVi:
      "Không bao gồm trị liệu, chẩn đoán, hỗ trợ khẩn cấp hoặc trò chuyện không giới hạn.",
    limitsEn:
      "Not therapy, diagnosis, emergency support, or unlimited chat.",
    needTags: ["listen"],
    image: "/fixtures/home/suggest-1.jpg",
    compare: {
      duration: 1,
      format: 2,
      personalization: 2,
      coordination: 1,
      dualSupport: 0,
    },
  },
  {
    code: "CMP-02",
    group: "companion",
    slug: "cung-trai-nghiem",
    titleVi: "Cùng trải nghiệm",
    titleEn: "Shared experience",
    listPriceVnd: 1_798_000,
    salePriceVnd: 1_498_000,
    durationVi: "1 buổi × 2 giờ",
    durationEn: "1 session × 2 hours",
    suitableVi:
      "Người muốn cùng cà phê, đi dạo, triển lãm hoặc hoạt động công cộng.",
    suitableEn:
      "People who want coffee, walks, exhibitions, or public activities together.",
    benefitsVi:
      "Chọn người; đề xuất hoạt động/địa điểm; thống nhất lịch trình; check-in/out và chia sẻ lịch cho người tin cậy.",
    benefitsEn:
      "Choose a provider; propose activity/place; agree schedule; check-in/out and share plan with a trusted contact.",
    processVi:
      "Chọn người → đề xuất hoạt động, địa điểm, ngân sách → hai bên xác nhận → thanh toán → gặp → kết thúc và đánh giá.",
    processEn:
      "Choose provider → propose activity, place, budget → both confirm → pay → meet → close and review.",
    usageVi:
      "Gặp tại địa điểm công cộng đã thống nhất; yêu cầu phát sinh phải được báo và chấp thuận trước.",
    usageEn:
      "Meet at the agreed public place; any change must be approved beforehand.",
    limitsVi:
      "Không gồm ăn uống, vé, quà, di chuyển ngoài phạm vi; không dịch vụ bảo vệ hoặc cam kết tình cảm.",
    limitsEn:
      "Excludes meals, tickets, gifts, out-of-scope travel; not security escort or romantic commitment.",
    needTags: ["experience"],
    image: "/fixtures/home/map-1.jpg",
    compare: {
      duration: 1,
      format: 2,
      personalization: 2,
      coordination: 2,
      dualSupport: 0,
    },
  },
  {
    code: "CMP-03",
    group: "companion",
    slug: "dong-hanh-muc-tieu",
    titleVi: "Đồng hành mục tiêu",
    titleEn: "Goal companionship",
    listPriceVnd: 3_980_000,
    salePriceVnd: 3_380_000,
    durationVi: "4 tuần; 4 buổi × 45 phút",
    durationEn: "4 weeks; 4 × 45-minute sessions",
    suitableVi:
      "Người muốn duy trì mục tiêu học tập, giao tiếp hoặc thói quen cá nhân.",
    suitableEn:
      "People maintaining study, communication, or personal habit goals.",
    benefitsVi:
      "Kế hoạch tuần; 4 buổi trực tuyến; ghi tiến độ riêng; tối đa 3 lượt trao đổi ngắn/tuần; phản hồi trong 1 ngày làm việc theo lịch công bố.",
    benefitsEn:
      "Weekly plan; 4 online sessions; private progress notes; up to 3 short check-ins/week; reply within 1 business day per published hours.",
    processVi:
      "Khai nhu cầu → xác nhận người/lịch → thanh toán → lập kế hoạch → 4 buổi theo tuần → tổng kết.",
    processEn:
      "Capture needs → confirm provider/schedule → pay → plan → 4 weekly sessions → wrap-up.",
    usageVi:
      "Theo dõi lịch và quyền lợi trong Hành trình của tôi; gửi cập nhật qua hội thoại dịch vụ được phân quyền.",
    usageEn:
      "Track schedule and benefits in My Journey; update via the authorized service thread.",
    limitsVi:
      "Không cam kết đạt mục tiêu; không bao gồm chuyên môn trị liệu.",
    limitsEn: "No guaranteed outcomes; not clinical therapy.",
    needTags: ["goals"],
    image: "/fixtures/home/article-2.jpg",
    compare: {
      duration: 2,
      format: 2,
      personalization: 3,
      coordination: 2,
      dualSupport: 0,
    },
  },
  {
    code: "CMP-04",
    group: "companion",
    slug: "dong-hanh-rieng",
    titleVi: "Đồng hành riêng",
    titleEn: "Private companionship",
    listPriceVnd: 11_980_000,
    salePriceVnd: 9_980_000,
    durationVi: "4 tuần; tổng 8 giờ; mỗi buổi ≥1 giờ",
    durationEn: "4 weeks; 8 hours total; sessions ≥1 hour",
    suitableVi: "Người cần lịch ổn định, kế hoạch cá nhân và hỗ trợ điều phối.",
    suitableEn:
      "People needing a stable schedule, personal plan, and coordination support.",
    benefitsVi:
      "Kế hoạch cá nhân; tổng 8 giờ; ưu tiên lịch còn trống; hỗ trợ đổi lịch/tìm người thay thế; tối đa 5 lượt trao đổi ngắn/tuần.",
    benefitsEn:
      "Personal plan; 8 hours total; priority on open slots; reschedule/replacement help; up to 5 short check-ins/week.",
    processVi:
      "Trao đổi nhu cầu → xác nhận khả năng đáp ứng và hình thức → thanh toán → thống nhất lịch → thực hiện từng buổi → tổng kết.",
    processEn:
      "Discuss needs → confirm capacity/format → pay → agree schedule → run sessions → wrap-up.",
    usageVi:
      "Xem lịch, số giờ còn lại và chuyên viên điều phối. Hình thức online/trực tiếp ghi rõ trong xác nhận đơn.",
    usageEn:
      "See schedule, remaining hours, and coordinator. Online/in-person format is stated in the confirmation.",
    limitsVi: "Không 24/7, không độc quyền người đồng hành.",
    limitsEn: "Not 24/7 and not exclusive companionship.",
    needTags: ["private", "goals"],
    image: "/fixtures/home/hero-portrait.jpg",
    compare: {
      duration: 2,
      format: 3,
      personalization: 3,
      coordination: 3,
      dualSupport: 1,
    },
  },
  {
    code: "MAT-01",
    group: "matchmaking",
    slug: "tim-nguoi-phu-hop",
    titleVi: "Tìm người phù hợp",
    titleEn: "Find a suitable match",
    listPriceVnd: 5_980_000,
    salePriceVnd: 4_980_000,
    durationVi: "30 ngày",
    durationEn: "30 days",
    suitableVi: "Người muốn được tuyển chọn hồ sơ rồi chủ động tìm hiểu.",
    suitableEn: "People who want curated profiles then self-paced outreach.",
    benefitsVi:
      "1 buổi nhu cầu 60 phút; bộ tiêu chí; tối đa 5 hồ sơ tuyển chọn; lý do phù hợp/khác biệt; tối đa 3 lời mời; 1 lần điều chỉnh tiêu chí.",
    benefitsEn:
      "1×60-min needs session; criteria set; up to 5 curated profiles; fit/gap notes; up to 3 invites; 1 criteria revision.",
    processVi:
      "Gửi nhu cầu → đánh giá nguồn hồ sơ → xác nhận tiếp nhận → thanh toán → phỏng vấn → tuyển chọn → xin đồng thuận hai chiều → kết nối → tổng kết.",
    processEn:
      "Submit needs → assess pool → accept case → pay → interview → curate → two-sided consent → connect → wrap-up.",
    usageVi:
      "Duyệt hồ sơ trong Hành trình của tôi; chấp nhận/từ chối riêng; người được giới thiệu không phải mua gói để phản hồi.",
    usageEn:
      "Review profiles in My Journey; accept/decline privately; introduced people need not buy a package to reply.",
    limitsVi:
      "Lời mời không phải kết nối thành công; không cam kết người yêu. Chỉ chia sẻ dữ liệu được chủ hồ sơ cho phép.",
    limitsEn:
      "An invite is not a successful match; no romantic guarantee. Only consented profile data is shared.",
    needTags: ["match"],
    image: "/fixtures/home/suggest-2.jpg",
    compare: {
      duration: 2,
      format: 2,
      personalization: 2,
      coordination: 2,
      dualSupport: 2,
    },
  },
  {
    code: "MAT-02",
    group: "matchmaking",
    slug: "tim-ban-doi",
    titleVi: "Tìm bạn đời",
    titleEn: "Find a life partner",
    listPriceVnd: 19_800_000,
    salePriceVnd: 16_980_000,
    durationVi: "90 ngày",
    durationEn: "90 days",
    suitableVi: "Người có mục tiêu nghiêm túc hướng tới hôn nhân.",
    suitableEn: "People with a serious path toward marriage.",
    benefitsVi:
      "2 buổi tìm hiểu; chuyên viên phụ trách; tiêu chí gia đình/con cái/tài chính/nơi sống/thời điểm; tối đa 8 hồ sơ, 5 lời mời, điều phối 3 buổi gặp có đồng thuận; phản hồi riêng sau hẹn.",
    benefitsEn:
      "2 discovery sessions; dedicated advisor; family/children/finance/location/timing criteria; up to 8 profiles, 5 invites, 3 consented meetings; private post-date feedback.",
    processVi:
      "Đánh giá nhu cầu/nguồn hồ sơ → tiếp nhận → thanh toán → 2 buổi khai thác → giới thiệu hai chiều → sắp xếp gặp → phản hồi và điều chỉnh → tổng kết.",
    processEn:
      "Assess needs/pool → accept → pay → 2 discovery sessions → two-sided intros → schedule meetings → feedback/adjust → wrap-up.",
    usageVi:
      "Xem hồ sơ và lời mời; chỉ lịch được cả hai xác nhận mới thành cuộc hẹn; quyết định tiếp tục thuộc từng người.",
    usageEn:
      "View profiles and invites; meetings only after both confirm; continuing is each person’s choice.",
    limitsVi:
      "Không cam kết kết hôn; không tự liên hệ gia đình; không ép tiếp tục.",
    limitsEn:
      "No marriage guarantee; no family outreach without consent; no pressure to continue.",
    needTags: ["life_partner", "match"],
    image: "/fixtures/home/suggest-3.jpg",
    compare: {
      duration: 3,
      format: 3,
      personalization: 3,
      coordination: 3,
      dualSupport: 3,
    },
  },
  {
    code: "MAT-03",
    group: "matchmaking",
    slug: "mai-moi-rieng",
    titleVi: "Mai mối riêng",
    titleEn: "Private matchmaking",
    listPriceVnd: 49_800_000,
    salePriceVnd: 43_800_000,
    durationVi: "180 ngày",
    durationEn: "180 days",
    suitableVi: "Người muốn chuyên viên theo sát hành trình tìm hiểu.",
    suitableEn: "People who want an advisor closely guiding the journey.",
    benefitsVi:
      "Chuyên viên chính + người thay thế; tối đa 12 hồ sơ, 8 lời mời, điều phối 6 buổi gặp; 6 buổi cá nhân; tối đa 3 đối thoại chung khi cả hai đồng ý; rà soát mỗi tháng.",
    benefitsEn:
      "Primary + backup advisor; up to 12 profiles, 8 invites, 6 meetings; 6 personal sessions; up to 3 joint dialogues with dual consent; monthly review.",
    processVi:
      "Đánh giá khả năng phục vụ → tiếp nhận → thanh toán → kế hoạch riêng → tuyển chọn/giới thiệu/gặp → hỗ trợ trao đổi → rà soát hàng tháng → tổng kết.",
    processEn:
      "Capacity check → accept → pay → private plan → curate/intro/meet → dialogue support → monthly review → wrap-up.",
    usageVi:
      "Theo dõi tiến trình, quyền lợi và lịch; từng buổi đối thoại chung cần đồng ý riêng của hai người; ghi chú riêng không chuyển cho đối phương.",
    usageEn:
      "Track progress, benefits, and schedule; each joint dialogue needs separate dual consent; private notes are never shared with the other person.",
    limitsVi:
      "Hạn mức tổng, không cộng gói dưới. Không cam kết hôn nhân, độc quyền, 24/7 hoặc quyền can thiệp đối phương.",
    limitsEn:
      "Package caps do not stack with lower tiers. No marriage, exclusivity, 24/7, or right to intervene with the other person.",
    needTags: ["exclusive", "life_partner", "match"],
    image: "/fixtures/home/hero-city.jpg",
    compare: {
      duration: 3,
      format: 3,
      personalization: 3,
      coordination: 3,
      dualSupport: 3,
    },
  },
];

export const NEED_TAG_LABELS: Record<
  CompanionNeedTag,
  { vi: string; en: string }
> = {
  listen: { vi: "Tâm sự", en: "Listening" },
  experience: { vi: "Trải nghiệm", en: "Experience" },
  goals: { vi: "Mục tiêu cá nhân", en: "Personal goals" },
  private: { vi: "Đồng hành riêng", en: "Private companion" },
  match: { vi: "Tìm người phù hợp", en: "Find a match" },
  life_partner: { vi: "Tìm bạn đời", en: "Life partner" },
  exclusive: { vi: "Mai mối riêng", en: "Private matchmaking" },
};

export function companionBySlug(slug: string) {
  return COMPANION_PACKAGES.find((p) => p.slug === slug) ?? null;
}

export function companionByCode(code: string) {
  return (
    COMPANION_PACKAGES.find(
      (p) => p.code.toLowerCase() === code.toLowerCase(),
    ) ?? null
  );
}

export function formatVnd(amount: number, locale = "vi-VN") {
  return `${amount.toLocaleString(locale)} ₫`;
}

export function offeringTitleForDb(pkg: CompanionPackage) {
  return `${pkg.code} · ${pkg.titleVi}`;
}
