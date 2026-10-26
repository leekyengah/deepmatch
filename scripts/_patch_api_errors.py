# -*- coding: utf-8 -*-
"""Replace hardcoded jsonError messages with detail keys; localize payload copy."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "apps/web/src/app/api"

# Exact 2nd-arg string → detail key (or None = use code default)
MSG_TO_KEY: dict[str, str | None] = {
    "Chưa đăng nhập.": None,
    "Sign in required": None,
    "Không thể truy cập tài nguyên.": None,
    "Invalid JSON": "invalidJson",
    "id required": "idRequired",
    "Not found": "notFound",
    "Lifestyle off": "flagLifestyleOff",
    "Lifestyle catalog is off": "flagLifestyleOff",
    "AI is off": "flagAiOff",
    "AI assist is off": "flagAiOff",
    "Explicit consent required for this AI purpose": "aiConsentRequired",
    "Unknown AI task": "aiUnknownTask",
    "Chat đang tắt.": "flagChatOff",
    "Thiếu conversation_id.": "missingConversationId",
    "Discovery đang tắt.": "flagDiscoveryOff",
    "Chưa bật discovery.": "flagDiscoveryUserOff",
    "Đồng hành đang tắt.": "flagConciergeOff",
    "Thanh toán đang tắt (ff_billing).": "flagBillingOff",
    "Gói Premium đang tắt.": "flagPremiumOff",
    "Media đang tắt.": "flagMediaOff",
    "Tải media đang tắt.": "flagMediaUploadOff",
    "Thiếu pin_id.": "missingPinId",
    "Thiếu title hoặc layer.": "missingPinFields",
    "Thiếu pin_id hoặc nội dung.": "missingPinJournal",
    "Không có trường cập nhật.": "noUpdateFields",
    "Không gian cặp đôi không còn active.": "coupleInactive",
    "Thiếu từ khóa địa điểm.": "missingPlaceQuery",
    "Geocode upstream lỗi.": "geocodeUpstream",
    "Thiếu consent_key hoặc version.": "missingConsent",
    "Không tìm thấy hồ sơ.": "profileNotFound",
    "Đối tượng chặn không hợp lệ.": "invalidBlockTarget",
    "Thiếu lý do báo cáo.": "missingReportReason",
    "Thiếu offering_id.": "missingOfferingId",
    "Dịch vụ không khả dụng.": "offeringUnavailable",
    "Thiếu signedTransaction (StoreKit 2 JWS).": "missingSignedTx",
    "JWS không hợp lệ.": "invalidJws",
    "Chưa cấu hình STRIPE_SECRET_KEY / STRIPE_PRICE_ID_PREMIUM trên production.": "stripeNotConfigured",
    "Stripe checkout thất bại.": "stripeCheckoutFailed",
    "Loại file không được hỗ trợ.": "unsupportedMediaType",
    "product_id required": "productIdRequired",
    "Product not found": "productNotFound",
    "Only SANDBOX_ONLY products for demo booking": "sandboxOnly",
    "Only SANDBOX_ONLY products": "sandboxOnly",
    "id and action required": "bookingActionInvalid",
    "Invalid action": "bookingActionInvalid",
    "Booking not found": "bookingNotFound",
    "Cart empty": "cartEmpty",
    "Too many lines": "cartTooManyLines",
    "display_name and contact_value required": "contactFieldsRequired",
    # Config internals → generic INTERNAL (no detail leak)
    "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY.": None,
}

# Patterns that pass error.message as 2nd arg
INTERNAL_MSG_RE = re.compile(
    r'jsonError\(\s*"INTERNAL"\s*,\s*([^,\)]+)\s*(?:,\s*([^)\n]+))?\s*\)'
)


def rewrite_json_error_calls(text: str) -> str:
    # jsonError("CODE", "literal", requestId?)
    def repl(m: re.Match[str]) -> str:
        code = m.group(1)
        msg = m.group(2)
        rest = m.group(3)  # optional , requestId
        if msg not in MSG_TO_KEY:
            return m.group(0)
        key = MSG_TO_KEY[msg]
        rid = rest.strip() if rest else ""
        if key is None:
            if rid:
                return f'jsonError("{code}", null, {rid})'
            return f'jsonError("{code}")'
        if rid:
            return f'jsonError("{code}", "{key}", {rid})'
        return f'jsonError("{code}", "{key}")'

    text = re.sub(
        r'jsonError\(\s*"([A-Z_]+)"\s*,\s*"([^"]*)"\s*(,\s*[^)]+)?\s*\)',
        repl,
        text,
    )

    # INTERNAL with dynamic message → drop message
    def repl_internal(m: re.Match[str]) -> str:
        second = m.group(1).strip()
        third = (m.group(2) or "").strip()
        if second.startswith('"') or second.startswith("'"):
            return m.group(0)  # already handled
        if third:
            return f'jsonError("INTERNAL", null, {third})'
        # second might be requestId only in weird cases; assume it's message
        if second in ("requestId", "request_id") or second.endswith("requestId"):
            return f'jsonError("INTERNAL", null, {second})'
        return 'jsonError("INTERNAL")'

    text = INTERNAL_MSG_RE.sub(repl_internal, text)
    return text


PAYLOAD_PAIRS = [
    (
        'banner: "BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT"',
        'banner: await apiT("demoBanner")',
    ),
    (
        '"DEMO_CHECKOUT_OK — không có thanh toán thật / không phải hóa đơn thương mại"',
        'await apiT("demoCheckoutOk")',
    ),
    (
        '"Không phải dịch vụ khẩn cấp. Không theo dõi GPS nền. Check-in tự nguyện."',
        'await apiT("safetyDisclaimer")',
    ),
    (
        'note: "Cửa sổ check-in đã tạo. Hết hạn tự động — không theo dõi liên tục."',
        'note: await apiT("safetyCheckinNote")',
    ),
    (
        '"URL ký ngắn hạn 5 phút. Sau unpair, truy cập pair media bị thu hồi theo RLS."',
        'await apiT("mediaExportNote")',
    ),
    (
        'note: "Signed upload unavailable — tạo bucket private `media` trên Supabase Storage."',
        'note: await apiT("mediaUploadNote")',
    ),
    (
        'display_name: "Đã xóa"',
        'display_name: await apiT("auth.deletedDisplayName")',
    ),
    (
        'peer_name: nameMap.get(peerId) ?? "Đối phương"',
        'peer_name: nameMap.get(peerId) ?? (await apiT("peerDefault"))',
    ),
    (
        'displayName: p?.displayName ?? "Thành viên"',
        'displayName: p?.displayName ?? (await apiT("memberDefault"))',
    ),
]


def ensure_api_t_import(text: str) -> str:
    if "apiT" in text and "from \"@/lib/api-error\"" in text:
        # upgrade import if only jsonError
        text = text.replace(
            'import { jsonError } from "@/lib/api-error";',
            'import { apiT, jsonError } from "@/lib/api-error";',
        )
        text = text.replace(
            'import { jsonError, makeRequestId } from "@/lib/api-error";',
            'import { apiT, jsonError, makeRequestId } from "@/lib/api-error";',
        )
        return text
    if "await apiT(" not in text:
        return text
    text = text.replace(
        'import { jsonError } from "@/lib/api-error";',
        'import { apiT, jsonError } from "@/lib/api-error";',
    )
    text = text.replace(
        'import { jsonError, makeRequestId } from "@/lib/api-error";',
        'import { apiT, jsonError, makeRequestId } from "@/lib/api-error";',
    )
    return text


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text
    text = rewrite_json_error_calls(text)

    # media size messages (ternary)
    text = text.replace(
        '? "Video vượt hạn mức 50MB hoặc kích thước không hợp lệ."\n'
        '      : "Kích thước ảnh không hợp lệ (tối đa 8MB)."',
        '? await apiT("videoTooLarge")\n'
        '      : await apiT("imageTooLarge")',
    )

    # AI quota template
    text = re.sub(
        r'`Đã hết hạn mức AI trong ngày \(\$\{quota\}\)[^`]*`',
        'await apiT("aiQuotaExceeded", { quota })',
        text,
    )

    # delete confirm message
    text = text.replace(
        "'Gửi { \"confirm\": \"DELETE\" } để xác nhận xóa tài khoản.'",
        'await apiT("deleteConfirmRequired")',
    )
    text = text.replace(
        '`Gửi { "confirm": "DELETE" } để xác nhận xóa tài khoản.`',
        'await apiT("deleteConfirmRequired")',
    )

    # catalog booking receipts — common patterns
    text = text.replace(
        "receipt: `DEMO_RESERVED · ${product.title} · không phải xác nhận thật`",
        'receipt: await apiT("demoReceiptReserved", { title: product.title })',
    )
    text = text.replace(
        "receipt: `DEMO_RESERVED · ${product.title} · ${product.price_vnd.toLocaleString(\"vi-VN\")}₫ · KHÔNG THANH TOÁN THẬT`",
        'receipt: await apiT("demoReceiptPriced", { title: product.title, price: `${product.price_vnd}₫` })',
    )
    text = text.replace(
        '? "Xác nhận DEMO — không phải đặt chỗ nhà cung cấp thật"\n'
        '      : "Đã hủy lệnh DEMO"',
        '? await apiT("demoConfirmed")\n'
        '      : await apiT("demoCancelled")',
    )

    # checkout stripe fallback
    text = text.replace(
        'session.error?.message ?? "Stripe checkout thất bại."',
        'session.error?.message ?? (await apiT("stripeCheckoutFailed"))',
    )

    for a, b in PAYLOAD_PAIRS:
        text = text.replace(a, b)

    # Product not found template
    text = re.sub(
        r'jsonError\(\s*"VALIDATION_ERROR"\s*,\s*`Product not found: \$\{([^}]+)\}`\s*\)',
        r'jsonError("VALIDATION_ERROR", "productNotFound")',
        text,
    )

    text = ensure_api_t_import(text)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    n = 0
    for p in sorted(API.rglob("route.ts")):
        if patch_file(p):
            n += 1
            print("patched", p.relative_to(ROOT).as_posix())
    print("files", n)


if __name__ == "__main__":
    main()
