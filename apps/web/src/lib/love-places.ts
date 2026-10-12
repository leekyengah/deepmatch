/** Editorial sample places for Love Map staging — not verified partner listings. */

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
  sample: true;
  ratingMean: number | null;
  ratingCount: number;
};

export const LOVE_PLACE_CATEGORIES = [
  { id: "cafe", labelVi: "Café hẹn đầu", labelEn: "First-date café" },
  { id: "restaurant", labelVi: "Nhà hàng hẹn đầu", labelEn: "First-date restaurant" },
  { id: "stay", labelVi: "Lưu trú đôi", labelEn: "Couple stay" },
  { id: "confession", labelVi: "Setup tỏ tình", labelEn: "Confession setup" },
  { id: "proposal", labelVi: "Setup cầu hôn", labelEn: "Proposal setup" },
] as const;

/** Coarse public points for map demo — names are illustrative samples. */
export const LOVE_PLACES: LovePlace[] = [
  {
    id: "hn-cafe-01",
    name: "Góc Yên — mẫu editorial",
    category: "cafe",
    city: "Hà Nội",
    district: "Hoàn Kiếm",
    address: "Phố cổ, Hà Nội (địa chỉ minh họa)",
    lat: 21.033,
    lng: 105.85,
    blurb: "Không gian yên, phù hợp trò chuyện lần đầu. Dữ liệu mẫu — chưa xác minh đối tác.",
    priceHint: "120–180k / người",
    sample: true,
    ratingMean: 4.6,
    ratingCount: 28,
  },
  {
    id: "hn-cafe-02",
    name: "Ánh chiều Lakeside — mẫu",
    category: "cafe",
    city: "Hà Nội",
    district: "Tây Hồ",
    address: "Khu vực Hồ Tây (minh họa)",
    lat: 21.058,
    lng: 105.823,
    blurb: "View hồ, ồn vừa phải. Chỉ dùng để thử UI Bản đồ hẹn hò.",
    priceHint: "150–220k / người",
    sample: true,
    ratingMean: 4.4,
    ratingCount: 19,
  },
  {
    id: "hn-rest-01",
    name: "Bàn đôi Soft Light — mẫu",
    category: "restaurant",
    city: "Hà Nội",
    district: "Ba Đình",
    address: "Ba Đình (minh họa)",
    lat: 21.035,
    lng: 105.814,
    blurb: "Không gian bàn đôi, menu rõ giá. Không phải đặt bàn thật.",
    priceHint: "350–600k / người",
    sample: true,
    ratingMean: 4.5,
    ratingCount: 41,
  },
  {
    id: "hcm-cafe-01",
    name: "Sài Gòn Quiet Cup — mẫu",
    category: "cafe",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "Quận 1 (minh họa)",
    lat: 10.776,
    lng: 106.7,
    blurb: "Café yên trung tâm — mẫu editorial cho Top 30.",
    priceHint: "100–160k / người",
    sample: true,
    ratingMean: 4.7,
    ratingCount: 52,
  },
  {
    id: "hcm-rest-01",
    name: "Dinner Lane — mẫu",
    category: "restaurant",
    city: "TP. Hồ Chí Minh",
    district: "Quận 3",
    address: "Quận 3 (minh họa)",
    lat: 10.782,
    lng: 106.69,
    blurb: "Nhà hàng hẹn đầu mẫu — chưa có đặt chỗ nhà cung cấp.",
    priceHint: "400–700k / người",
    sample: true,
    ratingMean: 4.3,
    ratingCount: 33,
  },
  {
    id: "hcm-stay-01",
    name: "Stay Quiet Suite — mẫu",
    category: "stay",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "Khu trung tâm (minh họa)",
    lat: 10.78,
    lng: 106.705,
    blurb: "Gợi ý lưu trú đôi — không phải inventory khách sạn thật.",
    priceHint: "1.8–3.5tr / đêm",
    sample: true,
    ratingMean: 4.2,
    ratingCount: 12,
  },
  {
    id: "hn-conf-01",
    name: "Setup tỏ tình Soft Stage — mẫu",
    category: "confession",
    city: "Hà Nội",
    district: "Cầu Giấy",
    address: "Dịch vụ theo khu vực (minh họa)",
    lat: 21.036,
    lng: 105.79,
    blurb: "Dịch vụ setup tỏ tình mẫu — liên hệ thật chưa mở.",
    priceHint: "Theo báo giá",
    sample: true,
    ratingMean: null,
    ratingCount: 0,
  },
  {
    id: "hcm-prop-01",
    name: "Proposal Atelier — mẫu",
    category: "proposal",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    address: "Theo khu vực (minh họa)",
    lat: 10.85,
    lng: 106.77,
    blurb: "Gợi ý tổ chức cầu hôn mẫu — không cam kết nhà cung cấp LIVE.",
    priceHint: "Theo báo giá",
    sample: true,
    ratingMean: null,
    ratingCount: 0,
  },
];

export function lovePlaceById(id: string) {
  return LOVE_PLACES.find((p) => p.id === id) ?? null;
}

export function lovePlacesByCity(city?: string) {
  if (!city) return LOVE_PLACES;
  return LOVE_PLACES.filter((p) => p.city === city);
}

/** Transparent Bayesian-ish ranking for samples with enough reviews. */
export function topLovePlaces(city: string, category?: LovePlace["category"], limit = 30) {
  const m = 5;
  const cohort = LOVE_PLACES.filter(
    (p) =>
      p.city === city &&
      (!category || p.category === category) &&
      (p.ratingCount ?? 0) > 0 &&
      p.ratingMean != null,
  );
  const C =
    cohort.reduce((s, p) => s + (p.ratingMean ?? 0), 0) / Math.max(cohort.length, 1) || 4.2;
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
