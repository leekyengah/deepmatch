# -*- coding: utf-8 -*-
"""Wave-4b: lifestyle, FAQ, legal, admin ops pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def ensure_import(text: str, marker: str, line: str) -> str:
    if marker in text:
        return text
    lines = text.splitlines(keepends=True)
    last_import = -1
    for i, ln in enumerate(lines):
        if ln.startswith("import "):
            last_import = i
    if last_import >= 0:
        lines.insert(last_import + 1, line + "\n")
        return "".join(lines)
    return line + "\n" + text


def ensure_server_t(text: str) -> str:
    text = ensure_import(
        text,
        "@/lib/i18n/server",
        'import { getServerTranslator } from "@/lib/i18n/server";',
    )
    if "const { t } = await getServerTranslator()" in text:
        return text
    text = re.sub(
        r"export default async function (\w+)\(([^)]*)\) \{\n",
        r"export default async function \1(\2) {\n  const { t } = await getServerTranslator();\n",
        text,
        count=1,
    )
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
            print(f"  MISS [{label}]: {a[:90]!r}")
        else:
            text = text.replace(a, b)
    return text


def patch_lifestyle() -> None:
    p = ROOT / "apps/web/src/app/(app)/lifestyle/orders/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        Lệnh DEMO\n", '        {t("commerce.ordersHeading")}\n'),
            (
                ">Sandbox — không thanh toán / giao hàng thật</Badge>",
                '>{t("commerce.ordersBadge")}</Badge>',
            ),
            ('title="Chưa có lệnh DEMO"', 'title={t("commerce.ordersEmptyTitle")}'),
            (
                'description="Mở một sản phẩm Lifestyle và bấm Yêu cầu DEMO."',
                'description={t("commerce.ordersEmptyBody")}',
            ),
            ('{p?.title ?? "Sản phẩm"}', '{p?.title ?? t("commerce.productDefault")}'),
        ],
        "orders",
    )
    p.write_text(t, encoding="utf-8")
    print("lifestyle orders")

    p = ROOT / "apps/web/src/app/(app)/lifestyle/[category]/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            (
                "        Nhà cung cấp trạng thái DEMO · SANDBOX_ONLY",
                '        {t("commerce.categoryDemoNote")}',
            ),
            (
                "          BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT",
                '          {t("commerce.lifestyleBadge")}',
            ),
            ('title="Chưa có mẫu"', 'title={t("commerce.categoryEmptyTitle")}'),
            (
                'description="Chạy seed catalog trên staging hoặc thử lại sau."',
                'description={t("commerce.categoryEmptyBody")}',
            ),
        ],
        "category",
    )
    p.write_text(t, encoding="utf-8")
    print("lifestyle category")

    p = ROOT / "apps/web/src/app/(app)/lifestyle/[category]/[mockId]/page.tsx"
    t = ensure_server_t(p.read_text(encoding="utf-8"))
    t = rp(
        t,
        [
            ("        ← Danh mục\n", '        {t("commerce.backCategory")}\n'),
            (
                "          Fulfillment: {product.fulfillment} — không có giờ mở cửa / tồn kho thật.",
                '          {t("commerce.fulfillmentNote", { mode: product.fulfillment })}',
            ),
        ],
        "product",
    )
    p.write_text(t, encoding="utf-8")
    print("lifestyle product")


def patch_faq_legal() -> None:
    # FAQ — rewrite cleanly
    (ROOT / "apps/web/src/app/faq/page.tsx").write_text(
        '''import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function FaqPage() {
  const { t } = await getServerTranslator();
  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" aria-label={t("nav.homeAria")}>
          <BrandLogo variant="full" className="h-9 w-auto" />
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-dm-raspberry/80">
          <Link href="/signup">{t("auth.getStarted")}</Link>
          <Link href="/login">{t("auth.login")}</Link>
        </nav>
      </header>

      <h1 className="mt-12 font-display text-4xl font-medium text-dm-raspberry">
        {t("faq.title")}
      </h1>
      <p className="mt-3 text-sm text-dm-muted">{t("faq.intro")}</p>

      <ul className="mt-10 space-y-6">
        {faqs.map((item) => (
          <li key={item.q}>
            <h2 className="text-lg font-semibold text-dm-raspberry">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-dm-ink/80">{item.a}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/signup">
          <Button type="button">{t("faq.createAccount")}</Button>
        </Link>
        <Link href="/">
          <Button type="button" variant="outline">
            {t("faq.backHome")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
''',
        encoding="utf-8",
    )
    print("faq")

    (ROOT / "apps/web/src/app/privacy/page.tsx").write_text(
        '''import Link from "next/link";
import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return { title: t("legal.privacyMetaTitle") };
}

export default async function PrivacyPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="font-display text-4xl text-dm-raspberry">
        {t("legal.privacyTitle")}
      </h1>
      <p className="mt-4 text-sm text-dm-muted">
        {t("legal.updated", { date: "12/10/2026" })}
      </p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-dm-ink/90">
        <p>{t("legal.privacyP1")}</p>
        <p>{t("legal.privacyP2")}</p>
        <p>{t("legal.privacyP3")}</p>
        <p>{t("legal.contact", { email: "support@datingvn.com" })}</p>
        <p className="text-xs text-dm-muted">{t("legal.humanReview")}</p>
      </div>
      <p className="mt-10">
        <Link href="/" className="text-sm text-dm-primary underline">
          {t("legal.backHome")}
        </Link>
      </p>
    </main>
  );
}
''',
        encoding="utf-8",
    )
    print("privacy")

    (ROOT / "apps/web/src/app/terms/page.tsx").write_text(
        '''import Link from "next/link";
import type { Metadata } from "next";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return { title: t("legal.termsMetaTitle") };
}

export default async function TermsPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="font-display text-4xl text-dm-raspberry">
        {t("legal.termsTitle")}
      </h1>
      <p className="mt-4 text-sm text-dm-muted">
        {t("legal.updated", { date: "12/10/2026" })}
      </p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-dm-ink/90">
        <p>{t("legal.termsP1")}</p>
        <p>{t("legal.termsP2")}</p>
        <p>
          {t("legal.termsP3")} {t("legal.contact", { email: "support@datingvn.com" })}
        </p>
        <p className="text-xs text-dm-muted">{t("legal.humanReview")}</p>
      </div>
      <p className="mt-10">
        <Link href="/" className="text-sm text-dm-primary underline">
          {t("legal.backHome")}
        </Link>
      </p>
    </main>
  );
}
''',
        encoding="utf-8",
    )
    print("terms")

    (ROOT / "apps/web/src/app/account-deletion/page.tsx").write_text(
        '''import Link from "next/link";
import type { Metadata } from "next";
import { deleteAccountAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("legal.deleteMetaTitle"),
    description: "How to delete your DeepMatch account",
  };
}

export default async function AccountDeletionPage() {
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-dm-ink">
      <h1 className="font-display text-4xl text-dm-raspberry">
        {t("legal.deleteTitle")}
      </h1>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        <li>{t("legal.deleteStep1")}</li>
        <li>{t("legal.deleteStep2")}</li>
        <li>{t("legal.deleteStep3")}</li>
      </ol>
      <form action={deleteAccountAction} className="mt-8 space-y-3 rounded-dm bg-white/80 p-6">
        <p className="text-sm text-dm-muted">{t("legal.deleteWebPrompt")}</p>
        <Input name="confirm" placeholder="DELETE" required autoComplete="off" />
        <Button type="submit" variant="outline" size="sm">
          {t("legal.deleteConfirmCta")}
        </Button>
      </form>
      <p className="mt-4 text-sm text-dm-muted">
        {t("legal.deleteSupport")}{" "}
        <a className="text-dm-primary underline" href="mailto:leekyengah@gmail.com">
          leekyengah@gmail.com
        </a>
      </p>
      <Link href="/privacy" className="mt-8 inline-block text-sm text-dm-primary">
        {t("legal.deletePrivacyLink")}
      </Link>
      <p className="mt-6 text-xs text-dm-muted">{t("legal.humanReview")}</p>
    </main>
  );
}
''',
        encoding="utf-8",
    )
    print("account-deletion")


def patch_admin() -> None:
    # CMS — rewrite cleanly (module-level entries need t)
    (ROOT / "apps/admin/src/app/cms/page.tsx").write_text(
        '''import { Card } from "@/components/ui/Card";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CmsPage() {
  const { t } = await getServerTranslator();
  const entries = [
    [t("admin.cmsFaq"), t("admin.cmsFaqDesc")],
    [t("admin.cmsPrivacy"), t("admin.cmsPrivacyDesc")],
    [t("admin.cmsNotify"), t("admin.cmsNotifyDesc")],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.cmsTitle")}</h1>
      <p className="mt-2 text-sm text-dm-muted">{t("admin.cmsIntro")}</p>
      <ul className="mt-6 space-y-3">
        {entries.map(([title, note]) => (
          <li key={title}>
            <Card>
              <h2 className="font-semibold text-dm-raspberry">{title}</h2>
              <p className="mt-1 text-sm text-dm-muted">{note}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
''',
        encoding="utf-8",
    )
    print("admin cms")

    pages = {
        "analytics": [
            (
                '["Đăng ký (profiles)", users]',
                '[t("admin.statSignups"), users]',
            ),
            ('["Cặp active", pairs]', '[t("admin.statActivePairs"), pairs]'),
            (
                '["Tin nhắn (tổng, không nội dung)", msgs]',
                '[t("admin.statMessages"), msgs]',
            ),
            (
                '["Bookings dịch vụ", bookings]',
                '[t("admin.statServiceBookings"), bookings]',
            ),
            (
                '<h1 className="text-2xl font-bold text-dm-raspberry">Phân tích</h1>',
                '<h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.analyticsTitle")}</h1>',
            ),
            (
                "        Aggregate counts — không xuất PII, không đọc body tin nhắn.",
                '        {t("admin.analyticsIntro")}',
            ),
        ],
        "billing": [
            (
                """      <h1 className="text-2xl font-bold text-dm-raspberry">
        Thanh toán chuyển khoản
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Đối soát STK HD Bank · xác nhận → Premium 30 ngày. Không giả paid.
      </p>""",
                """      <h1 className="text-2xl font-bold text-dm-raspberry">
        {t("admin.billingFull")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        {t("admin.billingIntro")}
      </p>""",
            ),
            ('title="Chưa có lệnh CK"', 'title={t("admin.billingEmptyTitle")}'),
            (
                'description="User tạo lệnh tại /me/premium."',
                'description={t("admin.billingEmptyBody")}',
            ),
            (
                "                      Nội dung CK kỳ vọng: {code} PREMIUM",
                '                      {t("admin.billingExpected", { code })}',
            ),
            (
                "                        Xác nhận đã nhận tiền\n",
                '                        {t("admin.billingConfirm")}\n',
            ),
        ],
        "catalog": [
            (
                """        Providers status DEMO only · LIVE bị chặn ở DB. Không bật đối tác thật từ
        đây.""",
                '        {t("admin.catalogIntro")}',
            ),
            (
                "<Badge tone=\"good\">{products ?? 0} sản phẩm</Badge>",
                '<Badge tone="good">{t("admin.productsCount", { n: products ?? 0 })}</Badge>',
            ),
            ("        Booking DEMO gần đây\n", '        {t("admin.recentDemoBookings")}\n'),
        ],
        "flags": [
            (
                """        Nguồn DB <code>feature_flags</code> (staff update). Env Vercel vẫn có thể
        override BFF nếu set tường minh.""",
                '        {t("admin.flagsIntro")}',
            ),
            (
                "          Đọc DB: {error.message} — đang hiện default local.",
                '          {t("admin.flagsDbError", { error: error.message })}',
            ),
            (
                '{row.enabled ? "Tắt" : "Bật"}',
                '{row.enabled ? t("admin.disable") : t("admin.enable")}',
            ),
        ],
        "matching": [
            (
                '<h1 className="text-2xl font-bold text-dm-raspberry">Vận hành ghép đôi</h1>',
                '<h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.matchingOps")}</h1>',
            ),
            (
                """        Số liệu nguồn hồ sơ + cờ matching/discovery. Không chỉnh ranking từ nhật
        ký riêng.""",
                '        {t("admin.matchingIntro")}',
            ),
            (
                '<p className="text-sm text-dm-muted">Hồ sơ discoverable</p>',
                '<p className="text-sm text-dm-muted">{t("admin.discoverable")}</p>',
            ),
        ],
        "moderation": [
            (
                '<h1 className="text-2xl font-bold text-dm-raspberry">Duyệt profile / ảnh</h1>',
                '<h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.modTitle")}</h1>',
            ),
            (
                """      <p className="mt-3 text-sm text-dm-muted">
        Ảnh riêng không mặc định công khai. Báo cáo mở:{" "}
        <strong>{openReports ?? 0}</strong> — xem chi tiết tại{" "}
        <Link href="/safety" className="underline">
          Safety
        </Link>
        .
      </p>""",
                """      <p className="mt-3 text-sm text-dm-muted">
        {t("admin.modIntro", { n: openReports ?? 0 })}{" "}
        <Link href="/safety" className="underline">
          {t("admin.safetyLinkShort")}
        </Link>
        .
      </p>""",
            ),
            ('title="Chưa có media gần đây"', 'title={t("admin.modEmptyTitle")}'),
            (
                'description="Upload intent tạo bản ghi media_objects — duyệt tay khi cần."',
                'description={t("admin.modEmptyBody")}',
            ),
        ],
        "safety": [
            (
                "        Hàng đợi báo cáo live. Suspend ghi audit qua RPC staff. Không giả số liệu.",
                '        {t("admin.safetyIntro")}',
            ),
            ('title="Chưa có báo cáo"', 'title={t("admin.safetyEmptyTitle")}'),
            (
                'description="Khi người dùng gửi báo cáo từ chat, hàng đợi hiện tại đây."',
                'description={t("admin.safetyEmptyBody")}',
            ),
        ],
        "services": [
            (
                "        Dịch vụ & chuyên viên\n",
                '        {t("admin.servicesFull")}\n',
            ),
            (
                "        Phân công advisor trong phạm vi staff. Ghi audit qua RPC.",
                '        {t("admin.servicesIntro")}',
            ),
            (
                'title="Chưa có booking cần phân công"',
                'title={t("admin.servicesEmptyTitle")}',
            ),
            (
                'description="Khi người dùng đặt dịch vụ (status requested), hàng đợi hiện tại đây."',
                'description={t("admin.servicesEmptyBody")}',
            ),
            (
                '(offering as { title?: string } | null)?.title ?? "Dịch vụ"',
                '(offering as { title?: string } | null)?.title ?? t("booking.serviceDefault")',
            ),
            (': " · chưa gán"}', ': t("admin.unassigned")}'),
            ("                          Chọn…\n", '                          {t("admin.choose")}\n'),
            (
                '{a.user_id === user?.id ? " (bạn)" : ""}',
                '{a.user_id === user?.id ? t("admin.you") : ""}',
            ),
        ],
        "users": [
            (
                '<h1 className="text-2xl font-bold text-dm-raspberry">Quản lý người dùng</h1>',
                '<h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.usersTitle")}</h1>',
            ),
            (
                "        Danh sách hồ sơ (staff RLS). Đình chỉ qua RPC có audit — không đọc chat.",
                '        {t("admin.usersIntro")}',
            ),
            (
                'title="Chưa có hồ sơ hoặc thiếu quyền staff"',
                'title={t("admin.usersEmptyTitle")}',
            ),
            (
                'description="Cần admin_roles + policy profiles_select_staff."',
                'description={t("admin.usersEmptyBody")}',
            ),
            ("<Badge>Ẩn</Badge>", '<Badge>{t("admin.hidden")}</Badge>'),
            (
                '{u.suspended ? "Mở khóa" : "Đình chỉ"}',
                '{u.suspended ? t("admin.unsuspend") : t("admin.suspend")}',
            ),
        ],
    }

    for name, pairs in pages.items():
        p = ROOT / f"apps/admin/src/app/{name}/page.tsx"
        t = ensure_server_t(p.read_text(encoding="utf-8"))
        t = rp(t, pairs, name)
        if name == "billing":
            t = t.replace(
                '{p.amount_cents.toLocaleString("vi-VN")}₫ · mã {code}',
                '{t("admin.billingAmount", { amount: (p.amount_cents).toLocaleString("vi-VN"), code })}',
            )
        p.write_text(t, encoding="utf-8")
        print("admin", name)


def main() -> None:
    patch_lifestyle()
    patch_faq_legal()
    patch_admin()
    print("batch B complete")


if __name__ == "__main__":
    main()
