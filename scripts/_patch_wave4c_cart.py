# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def merge(ns: str, vi: dict, en: dict) -> None:
    vip = ROOT / f"packages/i18n/locales/vi-VN/{ns}.json"
    enp = ROOT / f"packages/i18n/locales/en-US/{ns}.json"
    vo = json.loads(vip.read_text(encoding="utf-8"))
    eo = json.loads(enp.read_text(encoding="utf-8"))
    vo.update(vi)
    eo.update(en)
    vip.write_text(json.dumps(vo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    enp.write_text(json.dumps(eo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


merge(
    "commerce",
    {
        "cartDemo": "Giỏ DEMO",
        "cartIntro": "Giỏ hàng sandbox cục bộ. Checkout chỉ tạo lệnh DEMO — không thu thẻ, không phát hành hóa đơn thật.",
        "cartEmpty": "Giỏ DEMO trống.",
        "cartBackLifestyle": "Quay lại Lifestyle",
        "cartBanner": "BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT — không phải hóa đơn thương mại.",
        "cartRemove": "Xóa",
        "cartTotal": "Tổng DEMO: {amount}",
        "cartCheckout": "Checkout sandbox DEMO",
        "cartProcessing": "Đang xử lý…",
        "cartClear": "Xóa giỏ",
        "cartViewOrders": "Xem lệnh DEMO",
        "cartView": "Xem giỏ DEMO",
        "cartAdd": "Thêm vào giỏ DEMO",
        "cartAdded": "Đã thêm vào giỏ DEMO (sandbox)",
        "cartCheckoutFailed": "Checkout DEMO thất bại",
        "cartCheckoutOk": "DEMO_CHECKOUT_OK — không có thanh toán thật / không phải hóa đơn thương mại",
        "backLifestyle": "← Lifestyle",
    },
    {
        "cartDemo": "DEMO cart",
        "cartIntro": "Local sandbox cart. Checkout only creates DEMO orders — no card charge, no real invoice.",
        "cartEmpty": "DEMO cart is empty.",
        "cartBackLifestyle": "Back to Lifestyle",
        "cartBanner": "SAMPLE / NO REAL BOOKING OR PAYMENT — not a commercial invoice.",
        "cartRemove": "Remove",
        "cartTotal": "DEMO total: {amount}",
        "cartCheckout": "Sandbox DEMO checkout",
        "cartProcessing": "Processing…",
        "cartClear": "Clear cart",
        "cartViewOrders": "View DEMO orders",
        "cartView": "View DEMO cart",
        "cartAdd": "Add to DEMO cart",
        "cartAdded": "Added to DEMO cart (sandbox)",
        "cartCheckoutFailed": "DEMO checkout failed",
        "cartCheckoutOk": "DEMO_CHECKOUT_OK — no real payment / not a commercial invoice",
        "backLifestyle": "← Lifestyle",
    },
)

merge(
    "marketing",
    {"metaTitle": "DeepMatch — Mỗi kết nối, một hành trình đáng nhớ"},
    {"metaTitle": "DeepMatch — Every connection, a journey worth remembering"},
)

p = ROOT / "apps/web/src/components/lifestyle/AddToCartButton.tsx"
t = p.read_text(encoding="utf-8")
if "useT" not in t:
    t = t.replace(
        '"use client";\n\n',
        '"use client";\n\nimport { useT } from "@/components/i18n/I18nProvider";\n',
    )
    t = t.replace("  const [msg, setMsg]", "  const t = useT();\n  const [msg, setMsg]")
t = t.replace(
    'setMsg("Đã thêm vào giỏ DEMO (sandbox)")',
    'setMsg(t("commerce.cartAdded"))',
)
t = t.replace("        Thêm vào giỏ DEMO\n", '        {t("commerce.cartAdd")}\n')
p.write_text(t, encoding="utf-8")
print("AddToCartButton")

p = ROOT / "apps/web/src/components/lifestyle/DemoCartClient.tsx"
t = p.read_text(encoding="utf-8")
if "useT" not in t:
    t = t.replace(
        '"use client";\n\n',
        '"use client";\n\nimport { formatNumber } from "@deepmatch/i18n";\nimport { useI18n, useT } from "@/components/i18n/I18nProvider";\n',
    )
    t = t.replace(
        "export function DemoCartClient() {\n",
        "export function DemoCartClient() {\n  const t = useT();\n  const { locale } = useI18n();\n",
    )
pairs = [
    ('"Checkout DEMO thất bại"', 't("commerce.cartCheckoutFailed")'),
    (
        '"DEMO_CHECKOUT_OK — không có thanh toán thật / không phải hóa đơn thương mại"',
        't("commerce.cartCheckoutOk")',
    ),
    (
        '<p className="text-sm text-dm-muted">Giỏ DEMO trống.</p>',
        '<p className="text-sm text-dm-muted">{t("commerce.cartEmpty")}</p>',
    ),
    ("          Quay lại Lifestyle\n", '          {t("commerce.cartBackLifestyle")}\n'),
    (
        """        BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT — không phải hóa đơn
        thương mại.""",
        '        {t("commerce.cartBanner")}',
    ),
    ("                Xóa\n", '                {t("commerce.cartRemove")}\n'),
    (
        '        Tổng DEMO: {total.toLocaleString("vi-VN")}₫',
        '        {t("commerce.cartTotal", { amount: `${formatNumber(total, locale)}₫` })}',
    ),
    (
        '{busy ? "Đang xử lý…" : "Checkout sandbox DEMO"}',
        '{busy ? t("commerce.cartProcessing") : t("commerce.cartCheckout")}',
    ),
    ("          Xóa giỏ\n", '          {t("commerce.cartClear")}\n'),
    ("          Xem lệnh DEMO\n", '          {t("commerce.cartViewOrders")}\n'),
    (
        '{(l.priceVnd * l.qty).toLocaleString("vi-VN")}₫',
        "{`${formatNumber(l.priceVnd * l.qty, locale)}₫`}",
    ),
]
for a, b in pairs:
    if a not in t:
        print("MISS", a[:70])
    else:
        t = t.replace(a, b)
p.write_text(t, encoding="utf-8")
print("DemoCartClient")

p = ROOT / "apps/web/src/app/(app)/lifestyle/cart/page.tsx"
t = p.read_text(encoding="utf-8")
if "getServerTranslator" not in t:
    t = t.replace(
        "import { DemoCartClient }",
        'import { getServerTranslator } from "@/lib/i18n/server";\nimport { DemoCartClient }',
    )
    t = t.replace(
        "export default async function LifestyleCartPage() {\n",
        "export default async function LifestyleCartPage() {\n  const { t } = await getServerTranslator();\n",
    )
t = t.replace("        ← Lifestyle\n", '        {t("commerce.backLifestyle")}\n')
t = t.replace("          Giỏ DEMO\n", '          {t("commerce.cartDemo")}\n')
t = t.replace(
    """        Giỏ hàng sandbox cục bộ. Checkout chỉ tạo lệnh DEMO — không thu thẻ, không
        phát hành hóa đơn thật.""",
    '        {t("commerce.cartIntro")}',
)
p.write_text(t, encoding="utf-8")
print("cart page")

p = ROOT / "apps/web/src/app/(app)/lifestyle/page.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace('label: "Giỏ DEMO"', 'label: t("commerce.cartDemo")')
p.write_text(t, encoding="utf-8")
print("lifestyle home")

p = ROOT / "apps/web/src/app/(app)/lifestyle/[category]/[mockId]/page.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace("          Xem giỏ DEMO\n", '          {t("commerce.cartView")}\n')
p.write_text(t, encoding="utf-8")
print("product page")

p = ROOT / "apps/web/src/app/page.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace(
    'title: "DeepMatch — Mỗi kết nối, một hành trình đáng nhớ"',
    'title: t("marketing.metaTitle")',
)
p.write_text(t, encoding="utf-8")
print("home meta")
print("wave4c done")
