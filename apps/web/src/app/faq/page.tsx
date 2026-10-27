import Link from "next/link";
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
