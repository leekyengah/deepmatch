# -*- coding: utf-8 -*-
"""Wave-4: migrate remaining hardcoded VI UI to @deepmatch/i18n."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, data: dict) -> None:
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def merge_keys(ns: str, vi: dict, en: dict) -> None:
    vip = ROOT / f"packages/i18n/locales/vi-VN/{ns}.json"
    enp = ROOT / f"packages/i18n/locales/en-US/{ns}.json"
    vo, eo = load_json(vip), load_json(enp)
    vo.update(vi)
    eo.update(en)
    save_json(vip, vo)
    save_json(enp, eo)
    print(f"catalog {ns}: +{len(vi)}")


def ensure_import(text: str, marker: str, line: str) -> str:
    if marker in text:
        return text
    if text.startswith('"use client"'):
        return text.replace('"use client";\n\n', f'"use client";\n\n{line}\n', 1)
    # insert after last import block start — after first import line group
    lines = text.splitlines(keepends=True)
    last_import = -1
    for i, ln in enumerate(lines):
        if ln.startswith("import "):
            last_import = i
        elif last_import >= 0 and ln.strip() == "":
            break
        elif last_import >= 0 and not ln.startswith("import ") and not ln.startswith("  ") and not ln.startswith("}"):
            break
    if last_import >= 0:
        lines.insert(last_import + 1, line + "\n")
        return "".join(lines)
    return line + "\n" + text


def ensure_use_t(text: str) -> str:
    text = ensure_import(text, "@/components/i18n/I18nProvider", 'import { useT } from "@/components/i18n/I18nProvider";')
    if "const t = useT()" in text:
        return text
    text = re.sub(
        r"(export function \w+\([^)]*\) \{\n)",
        r"\1  const t = useT();\n",
        text,
        count=1,
    )
    return text


def ensure_server_t(text: str) -> str:
    text = ensure_import(
        text,
        "@/lib/i18n/server",
        'import { getServerTranslator } from "@/lib/i18n/server";',
    )
    if "getServerTranslator()" in text and "const { t }" in text:
        return text
    text = re.sub(
        r"export default async function (\w+)\(([^)]*)\) \{\n",
        r"export default async function \1(\2) {\n  const { t } = await getServerTranslator();\n",
        text,
        count=1,
    )
    # sync function -> async
    if "const { t } = await getServerTranslator()" not in text:
        text = re.sub(
            r"export default function (\w+)\(([^)]*)\) \{\n",
            r"export default async function \1(\2) {\n  const { t } = await getServerTranslator();\n",
            text,
            count=1,
        )
    return text


def rp(text: str, pairs: list[tuple[str, str]], label: str) -> str:
    for a, b in pairs:
        if a not in text:
            print(f"  MISS [{label}]: {a[:80]!r}")
        else:
            text = text.replace(a, b)
    return text


def patch_catalogs() -> None:
    merge_keys(
        "booking",
        {
            "servicesHeading": "Dịch vụ tư vấn",
            "servicesIntro": "Bốn dịch vụ tùy chọn. Phí, phạm vi và điều kiện hủy được công khai trước khi xác nhận. Không hứa kết quả ghép đôi.",
            "flagOffBodyStaging": "Feature flag ff_concierge đang tắt (mặc định staging an toàn).",
        },
        {
            "servicesHeading": "Consultation services",
            "servicesIntro": "Four optional services. Fees, scope, and cancel terms are shown before confirmation. No promised matching outcomes.",
            "flagOffBodyStaging": "Feature flag ff_concierge is off (safe staging default).",
        },
    )
    merge_keys(
        "memories",
        {
            "pageIntro": "Kỷ niệm dùng chung dữ liệu với bản đồ. Góc nhìn riêng chỉ hiện khi được chia sẻ.",
            "emptySpaceTitle": "Chưa có không gian cặp",
            "emptySpaceBody": "Cần lời mời hai phía trước khi xem dòng thời gian.",
            "inviteCta": "Lời mời",
            "addCta": "Thêm mới",
            "emptyTimelineBody": "Tạo ghim đầu tiên để bắt đầu dòng thời gian.",
        },
        {
            "pageIntro": "Shared memories use the same data as the map. Private notes stay private unless shared.",
            "emptySpaceTitle": "No couple space yet",
            "emptySpaceBody": "A two-sided invite is required before viewing the timeline.",
            "inviteCta": "Invite",
            "addCta": "Add new",
            "emptyTimelineBody": "Create your first pin to start the timeline.",
        },
    )
    merge_keys("chat", {"opening": "Đang mở chat…"}, {"opening": "Opening chat…"})
    merge_keys(
        "ai",
        {
            "taskProfileCoach": "Profile Coach",
            "taskStyle": "Style",
            "taskBeauty": "Beauty",
            "taskDatePlan": "Date plan",
            "taskTravel": "Du lịch",
            "giftOccasion": "buổi hẹn",
            "giftBudget": "vừa phải",
            "hubEyebrow": "AI Hub",
            "backLifestyle": "← Lifestyle",
            "backAiHub": "← AI Hub",
            "coachTitle": "Profile Coach",
        },
        {
            "taskProfileCoach": "Profile Coach",
            "taskStyle": "Style",
            "taskBeauty": "Beauty",
            "taskDatePlan": "Date plan",
            "taskTravel": "Travel",
            "giftOccasion": "a date",
            "giftBudget": "moderate",
            "hubEyebrow": "AI Hub",
            "backLifestyle": "← Lifestyle",
            "backAiHub": "← AI Hub",
            "coachTitle": "Profile Coach",
        },
    )
    merge_keys(
        "faq",
        {
            "a5": "99.000₫ / tháng. Thanh toán chuyển khoản HD Bank (STK 0964859937 — NGUYEN THI TUYET NHUNG). Tạo lệnh tại /me/premium, ghi đúng nội dung CK có mã.",
            "a6": "Tên miền đăng ký tại Matbao; DNS đã trỏ Vercel (Founder cập nhật). Chi tiết: docs/ops/DOMAIN_DATINGVN.md.",
        },
        {
            "a5": "99,000 VND / month. Pay by HD Bank transfer (account 0964859937 — NGUYEN THI TUYET NHUNG). Create an order at /me/premium and include the transfer code.",
            "a6": "Domain registered at Matbao; DNS points to Vercel (Founder updates). Details: docs/ops/DOMAIN_DATINGVN.md.",
        },
    )
    merge_keys(
        "admin",
        {
            "billingAmount": "{amount}₫ · mã {code}",
            "safetyLinkShort": "An toàn",
            "modIntro": "Ảnh riêng không mặc định công khai. Báo cáo mở: {n} — xem chi tiết tại",
        },
        {
            "billingAmount": "{amount}₫ · code {code}",
            "safetyLinkShort": "Safety",
            "modIntro": "Private photos are not public by default. Open reports: {n} — details in",
        },
    )


def patch_services() -> None:
    p = ROOT / "apps/web/src/components/services/ServicesClient.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('"Cần đăng nhập để xem dịch vụ."', 't("booking.servicesNeedAuth")'),
            ('"Không tải được danh mục dịch vụ."', 't("booking.servicesLoadError")'),
            ('"Không gửi được yêu cầu."', 't("booking.bookRequestFailed")'),
            ('"Đã gửi yêu cầu. Xem trạng thái tại Lịch hẹn."', 't("booking.bookRequestSent")'),
            ('label="Đang tải dịch vụ…"', 'label={t("booking.servicesLoading")}'),
            ('title="Không mở được Đồng hành"', 'title={t("booking.servicesErrorTitle")}'),
            ('<Button type="button">Đăng nhập</Button>', '<Button type="button">{t("auth.login")}</Button>'),
            ('title="Chưa có dịch vụ"', 'title={t("booking.servicesEmptyTitle")}'),
            (
                'description="Danh mục sẽ hiện sau khi quản trị kích hoạt offerings."',
                'description={t("booking.servicesEmptyBody")}',
            ),
            ("            Xem lịch hẹn\n", '            {t("booking.viewBookings")}\n'),
            ("<Badge>Tùy chọn</Badge>", '<Badge>{t("booking.optional")}</Badge>'),
            (
                '{bookingId === s.id ? "Đang gửi…" : "Đăng ký tư vấn"}',
                '{bookingId === s.id ? t("booking.sending") : t("booking.registerConsult")}',
            ),
        ],
        "ServicesClient",
    )
    t = t.replace("  }, []);", "  }, [t]);", 1)
    p.write_text(t, encoding="utf-8")
    print("ServicesClient")

    p = ROOT / "apps/web/src/components/services/BookingsClient.tsx"
    t = p.read_text(encoding="utf-8")
    t = ensure_import(t, "formatDateTime", 'import { formatDateTime } from "@deepmatch/i18n";')
    t = ensure_import(t, "useI18n", 'import { useI18n, useT } from "@/components/i18n/I18nProvider";')
    if 'requested: "Đã tiếp nhận"' in t:
        t = t.replace(
            """const statusLabel: Record<string, string> = {
  requested: "Đã tiếp nhận",
  assigned: "Đã phân công",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export function BookingsClient() {
  const [bookings""",
            """export function BookingsClient() {
  const t = useT();
  const { locale } = useI18n();
  const statusLabel: Record<string, string> = {
    requested: t("booking.statusRequested"),
    assigned: t("booking.statusAssigned"),
    completed: t("booking.statusCompleted"),
    cancelled: t("booking.statusCancelled"),
  };
  const [bookings""",
        )
    t = rp(
        t,
        [
            ('"Cần đăng nhập để xem lịch hẹn."', 't("booking.needAuth")'),
            ('"Không tải được lịch hẹn."', 't("booking.loadError")'),
            ('label="Đang tải lịch hẹn…"', 'label={t("booking.loading")}'),
            ('title="Không mở được lịch hẹn"', 'title={t("booking.errorTitle")}'),
            ('<Button type="button">Đăng nhập</Button>', '<Button type="button">{t("auth.login")}</Button>'),
            ('title="Chưa có lịch hẹn"', 'title={t("booking.emptyTitle")}'),
            (
                'description="Đăng ký dịch vụ Đồng hành để gửi yêu cầu; lịch sẽ xuất hiện sau khi hệ thống tiếp nhận."',
                'description={t("booking.emptyBody")}',
            ),
            ('<Button type="button">Xem dịch vụ</Button>', '<Button type="button">{t("booking.viewServices")}</Button>'),
            ('{b.title ?? "Dịch vụ"}', '{b.title ?? t("booking.serviceDefault")}'),
            (
                '{new Date(b.created_at).toLocaleString("vi-VN")}',
                "{formatDateTime(b.created_at, locale)}",
            ),
        ],
        "BookingsClient",
    )
    t = t.replace("  }, []);", "  }, [t]);", 1)
    p.write_text(t, encoding="utf-8")
    print("BookingsClient")


def patch_modals_maps() -> None:
    for rel in ["apps/web/src/components/ui/Modal.tsx", "apps/admin/src/components/ui/Modal.tsx"]:
        p = ROOT / rel
        t = ensure_use_t(p.read_text(encoding="utf-8"))
        t = t.replace("            Đóng\n", '            {t("common.close")}\n')
        p.write_text(t, encoding="utf-8")
        print(rel)

    p = ROOT / "apps/web/src/components/couple/CoupleOsmCanvas.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('"Không khởi tạo được bản đồ OSM."', 't("couple.osmInitError")'),
            (
                """        Chưa có ghim gắn tọa độ. Dùng “Tìm tọa độ” từ tên địa điểm hoặc nhập
        lat/lng thủ công.""",
                '        {t("couple.osmEmptyPins")}',
            ),
        ],
        "Osm",
    )
    p.write_text(t, encoding="utf-8")
    print("CoupleOsmCanvas")

    p = ROOT / "apps/web/src/components/couple/CoupleMapCanvas.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('"Không khởi tạo được Mapbox."', 't("couple.mapboxInitError")'),
            (
                """        Chưa có ghim gắn tọa độ — thêm lat/lng khi tạo ghim để hiện canvas Mapbox.
        Danh sách bên dưới vẫn dùng được.""",
                '        {t("couple.mapboxEmptyPins")}',
            ),
        ],
        "Mapbox",
    )
    p.write_text(t, encoding="utf-8")
    print("CoupleMapCanvas")


def patch_billing() -> None:
    p = ROOT / "apps/web/src/components/me/BankTransferClient.tsx"
    t = p.read_text(encoding="utf-8")
    t = ensure_import(t, "formatDateTime", 'import { formatDateTime } from "@deepmatch/i18n";')
    t = ensure_import(t, "useI18n", 'import { useI18n, useT } from "@/components/i18n/I18nProvider";')
    if "const t = useT()" not in t:
        t = t.replace(
            "export function BankTransferClient() {\n",
            "export function BankTransferClient() {\n  const t = useT();\n  const { locale } = useI18n();\n",
        )
    t = rp(
        t,
        [
            ('"Không tạo được lệnh chuyển khoản."', 't("commerce.bankCreateFailed")'),
            (
                '<p className="font-semibold text-dm-raspberry">Premium đang active</p>',
                '<p className="font-semibold text-dm-raspberry">{t("commerce.premiumActive")}</p>',
            ),
            (
                '<p className="font-semibold text-dm-raspberry">Chuyển khoản HD Bank</p>',
                '<p className="font-semibold text-dm-raspberry">{t("commerce.bankHdTitle")}</p>',
            ),
            (
                "            Ngân hàng: <strong>{bank.bankName}</strong>",
                '            {t("commerce.bankName", { name: bank.bankName })}',
            ),
            (
                "            Số tài khoản: <strong>{bank.accountNumber}</strong>",
                '            {t("commerce.bankAccount", { number: bank.accountNumber })}',
            ),
            (
                "            Người nhận: <strong>{bank.accountHolder}</strong>",
                '            {t("commerce.bankHolder", { name: bank.accountHolder })}',
            ),
            (
                "            Số tiền: <strong>{formatVnd(bank.priceVnd)}</strong> / tháng",
                '            {t("commerce.bankAmount", { amount: formatVnd(bank.priceVnd) })}',
            ),
            (
                "            Nội dung CK bắt buộc có mã (sau khi bấm tạo lệnh) để đối soát.",
                '            {t("commerce.bankContentHint")}',
            ),
            (
                '{busy ? "Đang tạo…" : "Tạo lệnh chuyển khoản Premium"}',
                '{busy ? t("commerce.bankCreating") : t("commerce.bankCreateCta")}',
            ),
            (
                '<p className="font-semibold text-dm-raspberry">Thông tin chuyển khoản</p>',
                '<p className="font-semibold text-dm-raspberry">{t("commerce.bankInfoTitle")}</p>',
            ),
            (
                "            Số tiền: <strong>{formatVnd(instruction.amount_vnd)}</strong>",
                '            {t("commerce.bankAmountLine", { amount: formatVnd(instruction.amount_vnd) })}',
            ),
            (
                "            Nội dung: <strong>{instruction.transfer_content}</strong>",
                '            {t("commerce.bankContentLine", { content: instruction.transfer_content })}',
            ),
            (
                """            Sau khi chuyển, giữ biên lai. Admin sẽ xác nhận trong vài giờ làm
            việc — Premium active khi trạng thái = paid.""",
                '            {t("commerce.bankAfterTransfer")}',
            ),
        ],
        "BankTransfer",
    )
    # expires line
    t = t.replace(
        """            Hết hạn:{" "}
            {sub.current_period_end
              ? new Date(sub.current_period_end).toLocaleString("vi-VN")
              : "—"}""",
        """            {t("commerce.expiresAt", {
              when: sub.current_period_end
                ? formatDateTime(sub.current_period_end, locale)
                : "—",
            })}""",
    )
    p.write_text(t, encoding="utf-8")
    print("BankTransferClient")

    p = ROOT / "apps/web/src/components/me/BillingClient.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            (
                '"Chưa mở thanh toán (cần Stripe keys + ff_billing)."',
                't("commerce.billingUnavailable")',
            ),
            (
                "        Gói trả phí đang tắt trên môi trường này (`ff_billing`).",
                '        {t("commerce.billingOffEnv")}',
            ),
            (
                """        Nâng cấp Premium qua Stripe Checkout (production). Không ghi nhận thanh
        toán giả.""",
                '        {t("commerce.billingStripeHint")}',
            ),
            (
                '{busy ? "Đang mở Stripe…" : "Thanh toán Premium"}',
                '{busy ? t("commerce.billingOpening") : t("commerce.billingPayCta")}',
            ),
        ],
        "Billing",
    )
    p.write_text(t, encoding="utf-8")
    print("BillingClient")


def patch_lifestyle_ai_clients() -> None:
    p = ROOT / "apps/web/src/components/lifestyle/DemoBookButton.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('"Không tạo được lệnh DEMO"', 't("commerce.demoBookFailed")'),
            (
                '{busy ? "Đang tạo…" : "Yêu cầu DEMO (sandbox)"}',
                '{busy ? t("commerce.demoCreating") : t("commerce.demoRequestCta")}',
            ),
        ],
        "DemoBook",
    )
    p.write_text(t, encoding="utf-8")
    print("DemoBookButton")

    p = ROOT / "apps/web/src/components/lifestyle/DemoBookingActions.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            (
                '<p className="mt-2 text-xs text-dm-muted">Đã hủy</p>',
                '<p className="mt-2 text-xs text-dm-muted">{t("commerce.demoCancelled")}</p>',
            ),
            ("          Xác nhận DEMO\n", '          {t("commerce.demoConfirm")}\n'),
            ("        Hủy\n", '        {t("common.cancel")}\n'),
        ],
        "DemoActions",
    )
    p.write_text(t, encoding="utf-8")
    print("DemoBookingActions")

    p = ROOT / "apps/web/src/components/ai/AiAssistClient.tsx"
    t = p.read_text(encoding="utf-8")
    t = ensure_use_t(t)
    old = """const TASKS = [
  { id: "deepmind", label: "Tự khám phá" },
  { id: "profile_coach", label: "Profile Coach" },
  { id: "gift", label: "Quà tặng" },
  { id: "style", label: "Style" },
  { id: "beauty", label: "Beauty" },
  { id: "date_plan", label: "Date plan" },
  { id: "travel", label: "Travel" },
  { id: "safety_tips", label: "An toàn" },
] as const;

type Suggestion = { title: string; body: string; demo?: boolean };

export function AiAssistClient() {
  const t = useT();
  const [task, setTask] = useState<(typeof TASKS)[number]["id"]>("gift");
"""
    new = """const TASK_IDS = [
  "deepmind",
  "profile_coach",
  "gift",
  "style",
  "beauty",
  "date_plan",
  "travel",
  "safety_tips",
] as const;

type Suggestion = { title: string; body: string; demo?: boolean };

export function AiAssistClient() {
  const t = useT();
  const tasks = [
    { id: "deepmind" as const, label: t("ai.taskDeepmind") },
    { id: "profile_coach" as const, label: t("ai.taskProfileCoach") },
    { id: "gift" as const, label: t("ai.taskGift") },
    { id: "style" as const, label: t("ai.taskStyle") },
    { id: "beauty" as const, label: t("ai.taskBeauty") },
    { id: "date_plan" as const, label: t("ai.taskDatePlan") },
    { id: "travel" as const, label: t("ai.taskTravel") },
    { id: "safety_tips" as const, label: t("ai.taskSafety") },
  ];
  const [task, setTask] = useState<(typeof TASK_IDS)[number]>("gift");
"""
    if old in t:
        t = t.replace(old, new)
    else:
        print("  MISS AiAssist TASKS block")
    t = t.replace("TASKS.map((t) => (", "tasks.map((item) => (")
    t = t.replace("key={t.id}", "key={item.id}")
    t = t.replace("onClick={() => setTask(t.id)}", "onClick={() => setTask(item.id)}")
    t = t.replace("task === t.id", "task === item.id")
    t = t.replace("{t.label}", "{item.label}")
    t = rp(
        t,
        [
            (
                'input: { occasion: "buổi hẹn", budget: "vừa phải" },',
                'input: { occasion: t("ai.giftOccasion"), budget: t("ai.giftBudget") },',
            ),
            ('"Không gọi được AI"', 't("ai.callFailed")'),
            ('setError("Lỗi mạng")', 'setError(t("ai.networkError"))'),
            (
                """        Tôi đồng ý dùng AI cho mục đích đã chọn (có thể thu hồi sau). Không dùng
        nhật ký riêng / chat thô mặc định.""",
                '        {t("ai.consentText")}',
            ),
            (
                '{loading ? "Đang tạo…" : "Nhận gợi ý"}',
                '{loading ? t("ai.creating") : t("ai.getSuggestions")}',
            ),
        ],
        "AiAssist",
    )
    p.write_text(t, encoding="utf-8")
    print("AiAssistClient")

    p = ROOT / "apps/web/src/components/ai/DeepMindClient.tsx"
    t = ensure_use_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('"Không lưu được"', 't("ai.saveFailed")'),
            ('"Không tạo được gợi ý"', 't("ai.insightFailed")'),
            ('confirm("Xóa toàn bộ câu trả lời DeepMind?")', 'confirm(t("ai.clearConfirm"))'),
            (
                '<p className="text-sm text-dm-muted">Đang tải…</p>',
                '<p className="text-sm text-dm-muted">{t("ai.loading")}</p>',
            ),
            (
                "            Câu {step + 1}/{DEEPMIND_QUESTIONS.length}",
                '            {t("ai.questionN", { n: step + 1, total: DEEPMIND_QUESTIONS.length })}',
            ),
            ("              Trước\n", '              {t("ai.prev")}\n'),
            ("              Tiếp\n", '              {t("ai.next")}\n'),
            (
                '{saving ? "Đang tạo…" : "Tạo thẻ tự phản ánh"}',
                '{saving ? t("ai.creating") : t("ai.makeCard")}',
            ),
            (
                '<p className="font-semibold text-dm-raspberry">Thẻ tự phản ánh (có thể sửa)</p>',
                '<p className="font-semibold text-dm-raspberry">{t("ai.cardTitle")}</p>',
            ),
            ("        Xóa toàn bộ DeepMind\n", '        {t("ai.clearAll")}\n'),
        ],
        "DeepMind",
    )
    p.write_text(t, encoding="utf-8")
    print("DeepMindClient")


def patch_web_shell_pages() -> None:
    # discover
    p = ROOT / "apps/web/src/app/(app)/discover/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        Tìm nhau\n", '        {t("discovery.title")}\n'),
            ("        Hồ sơ gợi ý\n", '        {t("discovery.pageHeading")}\n'),
            (
                """        Gợi ý có giải thích từ dữ liệu bạn chủ động cung cấp — không phải xác
        suất yêu. Mutual like mở chat, không tạo Chúng mình.""",
                '        {t("discovery.pageIntro")}',
            ),
            ('title="Tìm nhau đang tắt"', 'title={t("discovery.flagOffTitle")}'),
            (
                'description="Tính năng bị tắt bởi feature flag / kill switch."',
                'description={t("discovery.flagOffBody")}',
            ),
        ],
        "discover",
    )
    p.write_text(t, encoding="utf-8")
    print("discover")

    p = ROOT / "apps/web/src/app/(app)/likes/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        Tìm nhau\n", '        {t("discovery.title")}\n'),
            ("        Kết nối\n", '        {t("matching.title")}\n'),
            (
                """        Danh sách cùng thích. Chat chỉ mở khi đủ điều kiện mutual; không tự tạo
        không gian Chúng mình.""",
                '        {t("matching.pageIntro")}',
            ),
        ],
        "likes",
    )
    p.write_text(t, encoding="utf-8")
    print("likes")

    p = ROOT / "apps/web/src/app/(app)/chat/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = t.replace('label="Đang mở chat…"', 'label={t("chat.opening")}')
    p.write_text(t, encoding="utf-8")
    print("chat")

    p = ROOT / "apps/web/src/app/(app)/bookings/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('title="Đồng hành đang tắt"', 'title={t("booking.flagOffTitle")}'),
            (
                'description="Feature flag ff_concierge đang tắt."',
                'description={t("booking.flagOffBody")}',
            ),
            ("        Đồng hành\n", '        {t("booking.eyebrow")}\n'),
            ("        Lịch hẹn dịch vụ\n", '        {t("booking.heading")}\n'),
            (
                "        Theo dõi yêu cầu và lịch tư vấn. Không hiển thị trạng thái thành công giả.",
                '        {t("booking.intro")}',
            ),
        ],
        "bookings",
    )
    p.write_text(t, encoding="utf-8")
    print("bookings")

    p = ROOT / "apps/web/src/app/(app)/services/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ('title="Đồng hành đang tắt"', 'title={t("booking.flagOffTitle")}'),
            (
                'description="Feature flag ff_concierge đang tắt (mặc định staging an toàn)."',
                'description={t("booking.flagOffBodyStaging")}',
            ),
            ("            Đồng hành\n", '            {t("booking.eyebrow")}\n'),
            ("            Dịch vụ tư vấn\n", '            {t("booking.servicesHeading")}\n'),
            (
                """            Bốn dịch vụ tùy chọn. Phí, phạm vi và điều kiện hủy được công khai
            trước khi xác nhận. Không hứa kết quả ghép đôi.""",
                '            {t("booking.servicesIntro")}',
            ),
            ("            Xem lịch hẹn\n", '            {t("booking.viewBookings")}\n'),
        ],
        "services",
    )
    p.write_text(t, encoding="utf-8")
    print("services page")

    # AI hub
    p = ROOT / "apps/web/src/app/(app)/ai/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        ← Lifestyle\n", '        {t("ai.backLifestyle")}\n'),
            ("        AI Hub\n", '        {t("ai.hubEyebrow")}\n'),
            ("        Trợ lý có chọn lọc\n", '        {t("ai.hubHeading")}\n'),
            (
                "        Mỗi lần gọi cần đồng ý mục đích. Không tự gửi tin · không chẩn đoán lâm sàng.",
                '        {t("ai.hubIntro")}',
            ),
            (
                """          Adapter mặc định: stub · LLM khi AI_ADAPTER=openai
        """,
                '          {t("ai.adapterBadge")}\n        ',
            ),
            (">Consent bắt buộc</Badge>", '>{t("ai.consentBadge")}</Badge>'),
            (
                "          DeepMind — bộ câu hỏi tự nguyện →\n",
                '          {t("ai.deepmindLink")}\n',
            ),
        ],
        "ai hub",
    )
    p.write_text(t, encoding="utf-8")
    print("ai page")

    p = ROOT / "apps/web/src/app/(app)/ai/coach/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        ← AI Hub\n", '        {t("ai.backAiHub")}\n'),
            ("        Profile Coach\n", '        {t("ai.coachTitle")}\n'),
            (
                "        Gợi ý bản nháp — bạn tự chỉnh và lưu ở hồ sơ. AI không tự đăng.",
                '        {t("ai.coachIntro")}',
            ),
            (">Không auto-publish</Badge>", '>{t("ai.noAutoPublish")}</Badge>'),
            (
                "          Mở chỉnh sửa hồ sơ để lưu thủ công →\n",
                '          {t("ai.openEditProfile")}\n',
            ),
        ],
        "coach",
    )
    p.write_text(t, encoding="utf-8")
    print("coach")

    p = ROOT / "apps/web/src/app/(app)/ai/deepmind/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            (
                "        Bộ câu hỏi tự nguyện — không bắt buộc để dùng Tìm nhau.",
                '        {t("ai.deepmindIntro")}',
            ),
            (
                ">Không phải chẩn đoán lâm sàng</Badge>",
                '>{t("ai.notClinical")}</Badge>',
            ),
        ],
        "deepmind page",
    )
    p.write_text(t, encoding="utf-8")
    print("deepmind page")

    p = ROOT / "apps/web/src/app/(app)/couple/add/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        Chúng mình\n", '        {t("couple.title")}\n'),
            ("        Thêm ghim / kỷ niệm\n", '        {t("couple.addPageHeading")}\n'),
            (
                "        Lưu vào bản đồ ba lớp. Cảm nhận riêng (journal) mặc định chỉ bạn xem.",
                '        {t("couple.addPageIntro")}',
            ),
        ],
        "couple add",
    )
    p.write_text(t, encoding="utf-8")
    print("couple add")

    p = ROOT / "apps/web/src/app/(app)/couple/promises/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        Chúng mình\n", '        {t("couple.title")}\n'),
            ("        Hẹn ước · muốn cùng đến\n", '        {t("couple.promisesHeading")}\n'),
            (
                "        Danh sách lớp “Muốn cùng đến”. Chuyển thành kỷ niệm sau khi trải nghiệm.",
                '        {t("couple.promisesIntro")}',
            ),
            ('title="Chưa có không gian cặp"', 'title={t("couple.emptySpaceTitle")}'),
            ("                  Lời mời\n", '                  {t("memories.inviteCta")}\n'),
            ('title="Danh sách còn trống"', 'title={t("couple.promisesEmptyTitle")}'),
            (
                'description="Thêm nơi muốn cùng đến với lớp wishlist."',
                'description={t("couple.promisesEmptyBody")}',
            ),
            (
                "                  Thêm nơi muốn đến\n",
                '                  {t("couple.promisesAddCta")}\n',
            ),
        ],
        "promises",
    )
    p.write_text(t, encoding="utf-8")
    print("promises")

    p = ROOT / "apps/web/src/app/(app)/couple/memories/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    if 'visited: "Đã cùng đến"' in t:
        t = t.replace(
            """const layerLabel: Record<string, string> = {
  visited: "Đã cùng đến",
  wishlist: "Muốn cùng đến",
  milestone: "Dấu mốc",
};

export default async function CoupleMemoriesPage() {
  const { t } = await getServerTranslator();
  const supabase""",
            """export default async function CoupleMemoriesPage() {
  const { t } = await getServerTranslator();
  const layerLabel: Record<string, string> = {
    visited: t("couple.layerVisited"),
    wishlist: t("couple.layerWishlist"),
    milestone: t("couple.layerMilestone"),
  };
  const supabase""",
        )
    t = rp(
        t,
        [
            ("        Chúng mình\n", '        {t("couple.title")}\n'),
            ("        Dòng thời gian\n", '        {t("memories.timeline")}\n'),
            (
                """        Kỷ niệm dùng chung dữ liệu với bản đồ. Góc nhìn riêng chỉ hiện khi được
        chia sẻ.""",
                '        {t("memories.pageIntro")}',
            ),
            ('title="Chưa có không gian cặp"', 'title={t("memories.emptySpaceTitle")}'),
            (
                'description="Cần lời mời hai phía trước khi xem dòng thời gian."',
                'description={t("memories.emptySpaceBody")}',
            ),
            ("                  Lời mời\n", '                  {t("memories.inviteCta")}\n'),
            ('title="Chưa có kỷ niệm"', 'title={t("memories.emptyTitle")}'),
            (
                'description="Tạo ghim đầu tiên để bắt đầu dòng thời gian."',
                'description={t("memories.emptyTimelineBody")}',
            ),
            ("                  Thêm mới\n", '                  {t("memories.addCta")}\n'),
        ],
        "memories",
    )
    p.write_text(t, encoding="utf-8")
    print("memories")


def main() -> None:
    patch_catalogs()
    patch_services()
    patch_modals_maps()
    patch_billing()
    patch_lifestyle_ai_clients()
    patch_web_shell_pages()
    print("batch A complete")


if __name__ == "__main__":
    main()
