from pathlib import Path

p = Path("apps/web/src/components/couple/CoupleMapClient.tsx")
text = p.read_text(encoding="utf-8")
if "useT" not in text:
    text = text.replace(
        'import { LoadingState } from "@/components/ui/LoadingState";',
        'import { useT } from "@/components/i18n/I18nProvider";\nimport { LoadingState } from "@/components/ui/LoadingState";',
    )
    text = text.replace(
        """const layerLabel: Record<Pin["layer"], string> = {
  visited: "Đã cùng đến",
  wishlist: "Muốn cùng đến",
  milestone: "Dấu mốc",
};

export function CoupleMapClient({ coupleId }: { coupleId: string | null }) {
  const [pins, setPins]""",
        """export function CoupleMapClient({ coupleId }: { coupleId: string | null }) {
  const t = useT();
  const layerLabel: Record<Pin["layer"], string> = {
    visited: t("couple.layerVisited"),
    wishlist: t("couple.layerWishlist"),
    milestone: t("couple.layerMilestone"),
  };
  const [pins, setPins]""",
    )

pairs = [
    ('"Không tải được ghim (cần cặp đang active)."', 't("couple.mapLoadPinsError")'),
    ('"Không tạo được ghim."', 't("couple.addPinFailed")'),
    ('"Không xóa được ghim."', 't("couple.mapDeleteFailed")'),
    ('"Geocode thất bại."', 't("couple.mapGeocodeFailed")'),
    ('"Không tìm thấy địa điểm."', 't("couple.mapPlaceNotFound")'),
    ('"Không chuyển lớp được."', 't("couple.mapLayerFailed")'),
    ('title="Chưa có không gian Chúng mình"', 'title={t("couple.mapEmptySpaceTitle")}'),
    (
        'description="Cần lời mời và đồng ý hai phía trước khi dùng bản đồ kỷ niệm."',
        'description={t("couple.mapEmptySpaceBody")}',
    ),
    ("<Button type=\"button\">Mời kết nối</Button>", '<Button type="button">{t("couple.mapInviteCta")}</Button>'),
    ('label="Đang tải bản đồ…"', 'label={t("couple.mapLoading")}'),
    (
        "Bản đồ OSM miễn phí (không theo dõi GPS nền). Mapbox tùy chọn khi có\n          token.",
        '{t("couple.mapOsmHint")}',
    ),
    ('placeholder="Tiêu đề ghim"', 'placeholder={t("couple.pinTitlePh")}'),
    (
        'placeholder="Tên địa điểm (không bắt buộc tọa độ)"',
        'placeholder={t("couple.pinPlacePh")}',
    ),
    ('placeholder="Vĩ độ (tuỳ chọn)"', 'placeholder={t("couple.pinLatPh")}'),
    ('placeholder="Kinh độ (tuỳ chọn)"', 'placeholder={t("couple.pinLngPh")}'),
    ('<option value="visited">Đã cùng đến</option>', '<option value="visited">{t("couple.layerVisited")}</option>'),
    ('<option value="wishlist">Muốn cùng đến</option>', '<option value="wishlist">{t("couple.layerWishlist")}</option>'),
    ('<option value="milestone">Dấu mốc</option>', '<option value="milestone">{t("couple.layerMilestone")}</option>'),
    ('{geocoding ? "Đang tìm…" : "Tìm tọa độ"}', '{geocoding ? t("couple.geocoding") : t("couple.geocode")}'),
    (
        """          <Button type="submit" disabled={saving}>
            Thêm ghim
          </Button>""",
        """          <Button type="submit" disabled={saving}>
            {t("couple.submitPin")}
          </Button>""",
    ),
    (
        """            ["all", "Tất cả"],
            ["visited", "Đã cùng đến"],
            ["wishlist", "Muốn cùng đến"],
            ["milestone", "Dấu mốc"],""",
        """            ["all", t("couple.filterAll")],
            ["visited", t("couple.layerVisited")],
            ["wishlist", t("couple.layerWishlist")],
            ["milestone", t("couple.layerMilestone")],""",
    ),
    ('title="Chưa có ghim"', 'title={t("couple.pinsEmptyTitle")}'),
    (
        'description="Ghim chỉ thuộc không gian cặp đã kích hoạt; ghi chú cá nhân mặc định riêng tư."',
        'description={t("couple.pinsEmptyBody")}',
    ),
    ('title="Không có ghim ở lớp này"', 'title={t("couple.pinsFilterEmptyTitle")}'),
    ('description="Đổi bộ lọc hoặc thêm ghim mới."', 'description={t("couple.pinsFilterEmptyBody")}'),
    ('{p.place_label || "Không gắn tọa độ chính xác"}', '{p.place_label || t("couple.noExactCoords")}'),
    (
        """                      Đánh dấu đã đến
                    </Button>""",
        """                      {t("couple.markVisited")}
                    </Button>""",
    ),
    (
        """                    Xóa ghim của tôi
                  </Button>""",
        """                    {t("couple.deleteMyPin")}
                  </Button>""",
    ),
]

for a, b in pairs:
    if a not in text:
        print("MISS:", a[:60])
    text = text.replace(a, b)

text = text.replace("  }, [coupleId]);", "  }, [coupleId, t]);", 1)
p.write_text(text, encoding="utf-8")
print("done")
