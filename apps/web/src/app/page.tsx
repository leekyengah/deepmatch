import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PublicNav } from "@/components/marketing/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { resolveHomeState } from "@/lib/home-state";
import { getServerTranslator } from "@/lib/i18n/server";

/** Licensed Unsplash lifestyle imagery — see docs/design/IMAGE_ASSET_REGISTER.md */
const IMG = {
  hero:
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80",
  find:
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
  map:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
  care:
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
} as const;

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
  const year = new Date().getFullYear();

  const proofs = [
    [t("marketing.proofIntentTitle"), t("marketing.proofIntentBody")],
    [t("marketing.proofPrivacyTitle"), t("marketing.proofPrivacyBody")],
    [t("marketing.proofCompanionTitle"), t("marketing.proofCompanionBody")],
  ] as const;

  const journeys = [
    {
      href: "/signup",
      title: t("marketing.journeyFindTitle"),
      body: t("marketing.journeyFindBody"),
      img: IMG.find,
    },
    {
      href: "/couple",
      title: t("marketing.journeyMapTitle"),
      body: t("marketing.journeyMapBody"),
      img: IMG.map,
    },
    {
      href: "/services",
      title: t("marketing.journeyCareTitle"),
      body: t("marketing.journeyCareBody"),
      img: IMG.care,
    },
  ] as const;

  const steps = [
    [t("marketing.howStep1Title"), t("marketing.howStep1Body")],
    [t("marketing.howStep2Title"), t("marketing.howStep2Body")],
    [t("marketing.howStep3Title"), t("marketing.howStep3Body")],
  ] as const;

  return (
    <main className="min-h-screen bg-dm-canvas text-dm-ink">
      <AnalyticsBeacon event="home_view" props={{ path: "/" }} />
      <PublicNav />

      {/* WEB-02 Hero */}
      <section
        id="explore"
        className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-10 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-14"
      >
        <div>
          <h1 className="font-display text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-dm-ink md:text-5xl lg:text-[3.4rem]">
            {t("marketing.heroHeadline")}
          </h1>
          <p className="mt-5 max-w-md font-editorial text-base leading-relaxed text-dm-muted md:text-lg">
            {t("marketing.heroSupport")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-dm bg-dm-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dm-primary-hover)]"
            >
              {t("marketing.ctaDiscover")}
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center rounded-dm border border-dm-line bg-dm-panel px-5 py-3 text-sm font-semibold text-dm-ink"
            >
              {t("marketing.ctaLearn")}
            </a>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {proofs.map(([title, body]) => (
              <li key={title} className="text-sm">
                <p className="font-semibold text-dm-ink">{title}</p>
                <p className="mt-1 text-dm-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
        <figure className="relative overflow-hidden rounded-[22px] shadow-dm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG.hero}
            alt=""
            className="aspect-portrait w-full object-cover object-center"
            width={900}
            height={1200}
          />
          <figcaption className="sr-only">{t("marketing.photoCredit")}</figcaption>
        </figure>
      </section>

      {/* WEB-04 Journeys */}
      <section id="stories" className="bg-dm-panel px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl font-semibold text-dm-ink md:text-4xl">
            {t("marketing.journeysTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-editorial text-dm-muted">
            {t("marketing.journeysSupport")}
          </p>
          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {journeys.map((j) => (
              <Link
                key={j.href + j.title}
                href={j.href}
                className="group overflow-hidden rounded-[18px] border border-dm-line bg-dm-surface shadow-sm transition hover:shadow-dm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={j.img}
                  alt=""
                  className="aspect-[16/11] w-full object-cover"
                  width={640}
                  height={440}
                />
                <div className="relative p-5">
                  <h3 className="font-display text-xl font-semibold text-dm-ink">
                    {j.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dm-muted">
                    {j.body}
                  </p>
                  <span
                    aria-hidden
                    className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-dm-line text-dm-champagne transition group-hover:border-dm-primary group-hover:text-dm-primary"
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WEB-05 How */}
      <section id="how" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-dm-ink md:text-4xl">
              {t("marketing.howTitle")}
            </h2>
            <p className="mt-3 font-editorial text-dm-muted">
              {t("marketing.howSupport")}
            </p>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map(([title, body], i) => (
              <li key={title} className="border-t border-dm-line pt-6">
                <p className="text-xs font-bold tracking-[0.2em] text-dm-champagne">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold text-dm-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dm-muted">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WEB-06 Final CTA */}
      <section className="bg-dm-deep px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            {t("marketing.finalCtaTitle")}
          </h2>
          <p className="mt-3 font-editorial text-white/80">
            {t("marketing.finalCtaSupport")}
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-dm bg-white px-6 py-3 text-sm font-semibold text-dm-deep transition hover:bg-dm-blush"
          >
            {t("marketing.ctaDiscover")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-dm-line bg-dm-canvas px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <BrandLogo variant="full" className="h-8" />
            <p className="mt-3 text-sm text-dm-muted">
              {t("marketing.footerTagline")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm text-dm-ink/80 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <a href="#explore">{t("marketing.navExplore")}</a>
              <a href="#how">{t("marketing.navHow")}</a>
              <a href="#stories">{t("marketing.navStories")}</a>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/privacy">{t("marketing.footerPrivacy")}</Link>
              <Link href="/terms">{t("marketing.footerTerms")}</Link>
              <Link href="/safe">{t("marketing.footerSafety")}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/faq">{t("marketing.faq")}</Link>
              <Link href="/support">{t("marketing.footerSupport")}</Link>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs text-dm-muted">
          {t("marketing.footerCopyright", { year })}
        </p>
      </footer>
    </main>
  );
}
