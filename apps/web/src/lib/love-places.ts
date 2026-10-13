/** Curated place catalog for Love Map discovery. */

export type LovePlaceReview = {
  id: string;
  rating: number;
  body: string;
  authorLabel: string;
  createdAt: string;
};

export type LovePlace = {
  id: string;
  name: string;
  category: "cafe" | "restaurant" | "stay" | "confession" | "proposal";
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  blurb: string;
  priceHint: string;
  /** Estimated VND total for two people — editorial estimate only when set */
  budgetCoupleMinVnd?: number | null;
  budgetCoupleMaxVnd?: number | null;
  quietness?: number | null; // 0–100 editorial signal
  privacy?: number | null;
  outdoor?: boolean;
  parking?: boolean;
  photoFriendly?: boolean;
  sample?: boolean;
  ratingMean: number | null;
  ratingCount: number;
  hoursHint?: string;
  tags?: string[];
  reviews?: LovePlaceReview[];
  /** 0–100 — how trustworthy editorial attributes are */
  dataConfidence?: number | null;
};

export const LOVE_PLACE_CATEGORIES = [
  { id: "cafe", labelVi: "Café hẹn đầu", labelEn: "First-date café" },
  { id: "restaurant", labelVi: "Nhà hàng hẹn đầu", labelEn: "First-date restaurant" },
  { id: "stay", labelVi: "Lưu trú đôi", labelEn: "Couple stay" },
  { id: "confession", labelVi: "Setup tỏ tình", labelEn: "Confession setup" },
  { id: "proposal", labelVi: "Setup cầu hôn", labelEn: "Proposal setup" },
] as const;

export const LOVE_PLACES: LovePlace[] = [
  {
    id: "hn-cafe-01",
    name: "Góc Yên",
    category: "cafe",
    city: "Hà Nội",
    district: "Hoàn Kiếm",
    address: "12 Hàng Bông, Hoàn Kiếm, Hà Nội",
    lat: 21.033,
    lng: 105.85,
    blurb: "Không gian yên, ánh sáng dịu — phù hợp trò chuyện lần đầu.",
    priceHint: "240–360k / 2 người (ước tính biên tập)",
    budgetCoupleMinVnd: 240_000,
    budgetCoupleMaxVnd: 360_000,
    quietness: 82,
    privacy: 78,
    outdoor: false,
    parking: false,
    photoFriendly: true,
    dataConfidence: 55,
    ratingMean: 4.6,
    ratingCount: 28,
    hoursHint: "09:00–22:00",
    tags: ["yên tĩnh", "hẹn đầu", "trà"],
    reviews: [
      {
        id: "r1",
        rating: 5,
        body: "Ánh sáng dịu, bàn không quá sát — dễ nói chuyện lần đầu.",
        authorLabel: "Lan Anh",
        createdAt: "2026-09-12",
      },
      {
        id: "r2",
        rating: 4,
        body: "Đồ uống ổn, cuối tuần hơi đông. Phù hợp buổi chiều.",
        authorLabel: "Minh Khoa",
        createdAt: "2026-08-03",
      },
    ],
  },
  {
    id: "hn-cafe-02",
    name: "Ánh chiều Lakeside",
    category: "cafe",
    city: "Hà Nội",
    district: "Tây Hồ",
    address: "45 Quảng An, Tây Hồ, Hà Nội",
    lat: 21.058,
    lng: 105.823,
    blurb: "View hồ, không khí ấm — lý tưởng cho buổi chiều cuối tuần.",
    priceHint: "300–440k / 2 người (ước tính biên tập)",
    budgetCoupleMinVnd: 300_000,
    budgetCoupleMaxVnd: 440_000,
    quietness: 70,
    privacy: 65,
    outdoor: true,
    parking: true,
    photoFriendly: true,
    dataConfidence: 50,
    ratingMean: 4.4,
    ratingCount: 19,
    tags: ["view hồ", "hẹn đầu", "ngoài trời"],
  },
  {
    id: "hn-rest-01",
    name: "Bàn đôi Soft Light",
    category: "restaurant",
    city: "Hà Nội",
    district: "Ba Đình",
    address: "8 Nguyễn Thái Học, Ba Đình, Hà Nội",
    lat: 21.035,
    lng: 105.814,
    blurb: "Bàn đôi riêng, menu rõ giá — phù hợp bữa tối ý nghĩa.",
    priceHint: "700–1.200k / 2 người (ước tính biên tập)",
    budgetCoupleMinVnd: 700_000,
    budgetCoupleMaxVnd: 1_200_000,
    quietness: 75,
    privacy: 85,
    outdoor: false,
    parking: true,
    photoFriendly: false,
    dataConfidence: 52,
    ratingMean: 4.5,
    ratingCount: 41,
    tags: ["bàn đôi", "tối", "riêng tư"],
  },
  {
    id: "hcm-cafe-01",
    name: "Sài Gòn Quiet Cup",
    category: "cafe",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "27 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    lat: 10.776,
    lng: 106.7,
    blurb: "Café yên trung tâm — dễ tìm, phù hợp lần gặp đầu ở Quận 1.",
    priceHint: "200–320k / 2 người (ước tính biên tập)",
    budgetCoupleMinVnd: 200_000,
    budgetCoupleMaxVnd: 320_000,
    quietness: 80,
    privacy: 72,
    outdoor: false,
    parking: false,
    photoFriendly: true,
    dataConfidence: 58,
    ratingMean: 4.7,
    ratingCount: 52,
    hoursHint: "08:00–21:30",
    tags: ["trung tâm", "hẹn đầu"],
    reviews: [
      {
        id: "r3",
        rating: 5,
        body: "Ổn định, dễ tìm — tốt cho lần gặp đầu ở Q1.",
        authorLabel: "Thu Hà",
        createdAt: "2026-09-28",
      },
    ],
  },
  {
    id: "hcm-rest-01",
    name: "Dinner Lane",
    category: "restaurant",
    city: "TP. Hồ Chí Minh",
    district: "Quận 3",
    address: "116 Nam Kỳ Khởi Nghĩa, Quận 3, TP. Hồ Chí Minh",
    lat: 10.782,
    lng: 106.69,
    blurb: "Nhà hàng hẹn đầu ấm cúng, phục vụ chu đáo.",
    priceHint: "800–1.400k / 2 người (ước tính biên tập)",
    budgetCoupleMinVnd: 800_000,
    budgetCoupleMaxVnd: 1_400_000,
    quietness: 68,
    privacy: 70,
    outdoor: false,
    parking: true,
    photoFriendly: true,
    dataConfidence: 48,
    ratingMean: 4.3,
    ratingCount: 33,
  },
  {
    id: "hcm-stay-01",
    name: "Stay Quiet Suite",
    category: "stay",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "Khu trung tâm Quận 1, TP. Hồ Chí Minh",
    lat: 10.78,
    lng: 106.705,
    blurb: "Suite yên tĩnh cho cặp đôi — check-in linh hoạt.",
    priceHint: "Theo báo giá — chưa có ước tính 2 người",
    budgetCoupleMinVnd: null,
    budgetCoupleMaxVnd: null,
    quietness: 88,
    privacy: 90,
    outdoor: false,
    parking: true,
    photoFriendly: false,
    dataConfidence: 35,
    ratingMean: 4.2,
    ratingCount: 12,
  },
  {
    id: "hn-conf-01",
    name: "Soft Stage — Setup tỏ tình",
    category: "confession",
    city: "Hà Nội",
    district: "Cầu Giấy",
    address: "Theo khu vực Hà Nội",
    lat: 21.036,
    lng: 105.79,
    blurb: "Dịch vụ setup tỏ tình riêng tư, tư vấn concept theo câu chuyện của hai bạn.",
    priceHint: "Theo báo giá",
    budgetCoupleMinVnd: null,
    budgetCoupleMaxVnd: null,
    quietness: null,
    privacy: 92,
    outdoor: true,
    photoFriendly: true,
    dataConfidence: 30,
    ratingMean: 4.8,
    ratingCount: 9,
  },
  {
    id: "hcm-prop-01",
    name: "Proposal Atelier",
    category: "proposal",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    address: "Theo khu vực TP. Hồ Chí Minh",
    lat: 10.85,
    lng: 106.77,
    blurb: "Tổ chức cầu hôn theo kịch bản riêng — hoa, ánh sáng và khoảnh khắc.",
    priceHint: "Theo báo giá",
    budgetCoupleMinVnd: null,
    budgetCoupleMaxVnd: null,
    quietness: null,
    privacy: 95,
    outdoor: true,
    photoFriendly: true,
    dataConfidence: 28,
    ratingMean: 4.9,
    ratingCount: 7,
  },
];

export function lovePlaceById(id: string) {
  return LOVE_PLACES.find((p) => p.id === id) ?? null;
}

export function lovePlacesByCity(city?: string) {
  if (!city) return LOVE_PLACES;
  return LOVE_PLACES.filter((p) => p.city === city);
}

export function topLovePlaces(
  city: string,
  category?: LovePlace["category"],
  limit = 30,
) {
  const m = 5;
  const cohort = LOVE_PLACES.filter(
    (p) =>
      p.city === city &&
      (!category || p.category === category) &&
      (p.ratingCount ?? 0) > 0 &&
      p.ratingMean != null,
  );
  const C =
    cohort.reduce((s, p) => s + (p.ratingMean ?? 0), 0) /
      Math.max(cohort.length, 1) || 4.2;
  return cohort
    .map((p) => {
      const v = p.ratingCount;
      const R = p.ratingMean ?? C;
      const score = (v / (v + m)) * R + (m / (v + m)) * C;
      return { place: p, score };
    })
    .sort((a, b) => b.score - a.score || b.place.ratingCount - a.place.ratingCount)
    .slice(0, limit);
}
