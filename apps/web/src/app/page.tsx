import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PublicNav } from "@/components/marketing/PublicNav";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { resolveHomeState } from "@/lib/home-state";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("marketing.metaTitle"),
    description: t("marketing.heroSupport"),
    openGraph: {
      title: "DeepMatch",
      description: t("marketing.heroSupport"),
      type: "website",
      locale: "vi_VN",
      siteName: "DeepMatch",
      images: [{ url: "/brand/deepmatch-logo.svg" }],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const home = await resolveHomeState(user.id);
    if (home.state !== "guest") redirect(home.redirectTo);
  }

  const { t } = await getServerTranslator();

  const pillars = [
    {
      id: "find",
      title: t("marketing.pillarFindTitle"),
      body: t("marketing.pillarFindBody"),
      cta: t("marketing.pillarFindCta"),
      href: "/signup",
    },
    {
      id: "couple",
      title: t("marketing.pillarCoupleTitle"),
      body: t("marketing.pillarCoupleBody"),
      cta: t("marketing.pillarCoupleCta"),
      href: "/signup",
    },
    {
      id: "companion",
      title: t("marketing.pillarCompanionTitle"),
      body: t("marketing.pillarCompanionBody"),
      cta: t("marketing.pillarCompanionCta"),
      href: "/services",
    },
  ] as const;

  const steps = [
    [t("marketing.howStep1Title"), t("marketing.howStep1Body")],
    [t("marketing.howStep2Title"), t("marketing.howStep2Body")],
    [t("marketing.howStep3Title"), t("marketing.howStep3Body")],
    [t("marketing.howStep4Title"), t("marketing.howStep4Body")],
  ] as const;

  const aiCards = [
    [t("marketing.aiCoach"), t("marketing.aiCoachBody")],
    [t("marketing.aiDate"), t("marketing.aiDateBody")],
    [t("marketing.aiGift"), t("marketing.aiGiftBody")],
  ] as const;

  const lifestyle = [
    t("marketing.lifestyleGift"),
    t("marketing.lifestyleStyle"),
    t("marketing.lifestyleBeauty"),
    t("marketing.lifestyleDate"),
    t("marketing.lifestyleTravel"),
    t("marketing.lifestyleSafe"),
  ] as const;

  const trust = [
    [t("marketing.trustBlock"), t("marketing.trustBlockBody")],
    [t("marketing.trustPrivacy"), t("marketing.trustPrivacyBody")],
    [t("marketing.trustAdult"), t("marketing.trustAdultBody")],
  ] as const;

  return (
    <main className="min-h-screen text-dm-ink">
      <AnalyticsBeacon event="home_view" props={{ path: "/" }} />
      <PublicNav />

      <section className="relative isolate min-h-[min(92vh,880px)] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,#ffd0e0_0%,transparent_45%),radial-gradient(ellipse_at_90%_20%,#f6c1d2_0%,transparent_40%),linear-gradient(165deg,#fff8fa_0%,#ffe8f0_45%,#ffd4e4_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-dm-canvas to-transparent"
        />
        <div className="relative z-10 mx-auto flex min-h-[min(92vh,880px)] max-w-6xl flex-col justify-center px-6 pb-20 pt-8">
          <BrandLogo
            variant="full"
            className="h-14 w-auto max-w-[280px] md:h-16 md:max-w-[340px]"
          />
          <h1 className="mt-8 max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight text-dm-raspberry md:text-5xl lg:text-6xl">
            {t("marketing.heroHeadline")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-dm-ink/75 md:text-lg">
            {t("marketing.heroSupport")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button type="button">{t("marketing.ctaDiscover")}</Button>
            </Link>
            <Link href="/signup">
              <Button type="button" variant="outline">
                {t("marketing.ctaCoupleMap")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="pillars" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
          {t("marketing.pillarsTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-dm-ink/70">
          {t("marketing.pillarsSupport")}
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.id} id={p.id === "companion" ? "companion" : undefined}>
              <h3 className="font-display text-2xl text-dm-raspberry">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dm-ink/75">{p.body}</p>
              <Link
                href={p.href}
                className="mt-5 inline-block text-sm font-semibold text-dm-primary underline-offset-4 hover:underline"
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-dm-line/80 bg-dm-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
            {t("marketing.howTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-dm-ink/70">{t("marketing.howSupport")}</p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, body], i) => (
              <li key={title}>
                <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-xl text-dm-raspberry">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dm-ink/75">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link href="/signup">
              <Button type="button">{t("marketing.ctaStart")}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="ai" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
          {t("marketing.aiTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-dm-ink/70">{t("marketing.aiSupport")}</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {aiCards.map(([title, body]) => (
            <div key={title}>
              <h3 className="font-display text-xl text-dm-raspberry">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dm-ink/75">{body}</p>
            </div>
          ))}
        </div>
        <Link
          href="/signup"
          className="mt-8 inline-block text-sm font-semibold text-dm-primary underline-offset-4 hover:underline"
        >
          {t("marketing.aiCta")}
        </Link>
      </section>

      <section
        id="couple"
        className="relative overflow-hidden border-y border-dm-line/80 bg-gradient-to-br from-[#FFF3F7] via-[#FFE0EB] to-[#FFB4CC] py-20"
      >
        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="max-w-xl font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
            {t("marketing.couplePreviewTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-dm-ink/75">
            {t("marketing.couplePreviewSupport")}
          </p>
          <div
            aria-hidden
            className="mt-10 h-48 max-w-xl rounded-dm-xl border border-white/50 bg-[radial-gradient(circle_at_30%_40%,#e95383_0%,transparent_35%),radial-gradient(circle_at_70%_60%,#822d4c_0%,transparent_40%),linear-gradient(135deg,#fff8fa,#f6c1d2)] opacity-90 shadow-dm"
          />
          <div className="mt-8">
            <Link href="/signup">
              <Button type="button" variant="outline">
                {t("marketing.couplePreviewCta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="lifestyle" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
          {t("marketing.lifestyleDemoBadge")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
          {t("marketing.lifestyleTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-dm-ink/70">
          {t("marketing.lifestyleSupport")}
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-dm-raspberry">
          {lifestyle.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link
          href="/signup"
          className="mt-8 inline-block text-sm font-semibold text-dm-primary underline-offset-4 hover:underline"
        >
          {t("marketing.lifestyleCta")}
        </Link>
      </section>

      <section id="safety" className="border-y border-dm-line/80 bg-dm-surface/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
            {t("marketing.trustTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-dm-ink/70">{t("marketing.trustSupport")}</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {trust.map(([title, body]) => (
              <div key={title}>
                <h3 className="font-display text-xl text-dm-raspberry">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dm-ink/75">{body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/faq"
            className="mt-8 inline-block text-sm font-semibold text-dm-primary underline-offset-4 hover:underline"
          >
            {t("marketing.trustCta")}
          </Link>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-medium text-dm-raspberry md:text-4xl">
          {t("marketing.faqTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-dm-ink/70">{t("marketing.faqSupport")}</p>
        <Link href="/faq" className="mt-6 inline-block">
          <Button type="button" variant="outline">
            {t("marketing.faqCta")}
          </Button>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-dm-xl bg-gradient-to-br from-dm-primary to-dm-deep px-8 py-12 text-white shadow-dm md:px-12">
          <h2 className="font-display text-3xl font-medium md:text-4xl">
            {t("marketing.finalCtaTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-white/85">
            {t("marketing.finalCtaSupport")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button
                type="button"
                className="!bg-white !text-dm-raspberry hover:!bg-dm-canvas"
              >
                {t("marketing.ctaSignup")}
              </Button>
            </Link>
            <Link href="/login">
              <Button
                type="button"
                variant="outline"
                className="!border-white/60 !text-white hover:!bg-white/10"
              >
                {t("marketing.ctaLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-dm-line/80 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-dm-muted md:flex-row md:items-center md:justify-between">
          <p>{t("marketing.footerTagline")}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/faq">{t("marketing.faq")}</Link>
            <Link href="/legal">{t("marketing.footerLegal")}</Link>
            <Link href="/legal/privacy">{t("marketing.footerPrivacy")}</Link>
            <Link href="/legal/terms">{t("marketing.footerTerms")}</Link>
            <Link href="/support">{t("marketing.footerSupport")}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
