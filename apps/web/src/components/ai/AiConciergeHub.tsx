"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { AiChatWorkspace } from "@/components/ai/AiChatWorkspace";
import { AiContextPanel } from "@/components/ai/AiContextPanel";

type ModuleStatus = "WORKING" | "PARTIAL" | "UI_ONLY";

type NavId =
  | "dashboard"
  | "chat"
  | "history"
  | "tools"
  | "privacy"
  | "settings";

const MODULES: {
  id: string;
  href: string;
  task: string;
  titleKey: string;
  bodyKey: string;
  status: ModuleStatus;
  image: string;
}[] = [
  {
    id: "coach",
    href: "/ai/coach",
    task: "profile_coach",
    titleKey: "ai.taskProfileCoach",
    bodyKey: "ai.entryCoachBody",
    status: "PARTIAL",
    image: "/fixtures/home/hero-city.jpg",
  },
  {
    id: "deepmind",
    href: "/ai/deepmind",
    task: "deepmind",
    titleKey: "ai.taskDeepmind",
    bodyKey: "ai.entryDeepmindBody",
    status: "WORKING",
    image: "/fixtures/home/hero-portrait.jpg",
  },
  {
    id: "gift",
    href: "/lifestyle/gift",
    task: "gift",
    titleKey: "ai.taskGift",
    bodyKey: "ai.entryGiftBody",
    status: "PARTIAL",
    image: "/fixtures/home/suggest-1.jpg",
  },
  {
    id: "style",
    href: "/lifestyle/fashion",
    task: "style",
    titleKey: "ai.taskStyle",
    bodyKey: "ai.entryStyleBody",
    status: "PARTIAL",
    image: "/fixtures/home/suggest-2.jpg",
  },
  {
    id: "beauty",
    href: "/lifestyle/beauty",
    task: "beauty",
    titleKey: "ai.taskBeauty",
    bodyKey: "ai.entryBeautyBody",
    status: "PARTIAL",
    image: "/fixtures/home/suggest-3.jpg",
  },
  {
    id: "date",
    href: "/lifestyle/venue",
    task: "date_plan",
    titleKey: "ai.taskDatePlan",
    bodyKey: "ai.entryDateBody",
    status: "PARTIAL",
    image: "/fixtures/home/map-1.jpg",
  },
  {
    id: "travel",
    href: "/lifestyle/travel",
    task: "travel",
    titleKey: "ai.taskTravel",
    bodyKey: "ai.entryTravelBody",
    status: "PARTIAL",
    image: "/fixtures/home/map-2.jpg",
  },
  {
    id: "safe",
    href: "/safe",
    task: "safety_tips",
    titleKey: "ai.taskSafety",
    bodyKey: "ai.entrySafeBody",
    status: "WORKING",
    image: "/fixtures/home/article-1.jpg",
  },
];

function statusLabel(status: ModuleStatus, t: (k: string) => string) {
  if (status === "WORKING") return t("ai.statusWorking");
  if (status === "PARTIAL") return t("ai.statusPartial");
  return t("ai.statusUiOnly");
}

export function AiConciergeHub() {
  const t = useT();
  const [nav, setNav] = useState<NavId>("dashboard");
  const [contextOpen, setContextOpen] = useState(true);
  const [activeTask, setActiveTask] = useState("gift");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(
    () =>
      [
        { id: "dashboard" as const, label: t("ai.navDashboard") },
        { id: "chat" as const, label: t("ai.navNewChat") },
        { id: "history" as const, label: t("ai.navHistory") },
        { id: "tools" as const, label: t("ai.navTools") },
        { id: "privacy" as const, label: t("ai.navPrivacy") },
        { id: "settings" as const, label: t("ai.navSettings") },
      ] as const,
    [t],
  );

  const startChat = useCallback((task?: string) => {
    if (task) setActiveTask(task);
    setNav("chat");
    setMobileNavOpen(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "chat") setNav("chat");
    if (hash === "tools") setNav("tools");
  }, []);

  return (
    <div className="dm-page-frame pb-16">
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          className="min-h-11 rounded-full border border-dm-line bg-dm-surface px-4 text-sm font-semibold text-dm-ink"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-expanded={mobileNavOpen}
        >
          {t("ai.navMenu")}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-dm-line bg-dm-surface px-4 text-sm font-semibold text-dm-ink"
          onClick={() => setContextOpen((v) => !v)}
        >
          {contextOpen ? t("ai.hideContext") : t("ai.showContext")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* Left nav */}
        <aside
          className={
            mobileNavOpen
              ? "rounded-[20px] border border-dm-line bg-dm-surface p-4 shadow-[0_12px_40px_rgba(36,26,28,0.06)]"
              : "hidden lg:block rounded-[20px] border border-dm-line bg-dm-surface p-4 shadow-[0_12px_40px_rgba(36,26,28,0.06)]"
          }
        >
          <p className="font-display text-lg font-semibold text-dm-ink">
            {t("ai.assistant")}
          </p>
          <p className="mt-1 text-xs text-dm-muted">{t("ai.navSubtitle")}</p>
          <nav className="mt-5 space-y-1" aria-label={t("ai.assistant")}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setNav(item.id);
                  setMobileNavOpen(false);
                }}
                className={
                  nav === item.id
                    ? "flex min-h-11 w-full items-center rounded-xl bg-dm-primary px-3 text-left text-sm font-semibold text-white"
                    : "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-medium text-dm-ink hover:bg-dm-blush"
                }
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 space-y-8">
          {nav === "dashboard" || nav === "tools" ? (
            <>
              <section className="overflow-hidden rounded-[22px] border border-dm-line bg-dm-surface shadow-[0_12px_40px_rgba(36,26,28,0.06)]">
                <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="p-6 sm:p-8">
                    <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-dm-champagne">
                      {t("ai.hubEyebrow")}
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-dm-ink sm:text-4xl">
                      {t("ai.premiumHeading")}
                    </h1>
                    <p className="mt-3 max-w-xl font-editorial text-sm leading-relaxed text-dm-muted sm:text-base">
                      {t("ai.premiumIntro")}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => startChat()}>
                        {t("ai.ctaStartChat")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNav("tools")}
                      >
                        {t("ai.ctaExploreAssistants")}
                      </Button>
                      <Link href="/legal/ai" className="inline-flex">
                        <Button type="button" variant="ghost">
                          {t("ai.ctaGuide")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="relative min-h-[200px] md:min-h-full">
                    <Image
                      src="/fixtures/home/ai-avatar.jpg"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241A1C]/55 to-transparent" />
                  </div>
                </div>
              </section>

              <section id="tools">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-dm-ink">
                      {t("ai.toolsHeading")}
                    </h2>
                    <p className="mt-1 text-sm text-dm-muted">
                      {t("ai.toolsIntro")}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {MODULES.map((m) => (
                    <article
                      key={m.id}
                      className="overflow-hidden rounded-[18px] border border-dm-line bg-dm-surface shadow-[0_8px_28px_rgba(36,26,28,0.05)]"
                    >
                      <div className="relative h-28">
                        <Image
                          src={m.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base font-semibold text-dm-ink">
                            {t(m.titleKey)}
                          </h3>
                          <span className="shrink-0 rounded-full bg-dm-blush px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dm-primary">
                            {statusLabel(m.status, t)}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-dm-muted">
                          {t(m.bodyKey)}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Link href={m.href}>
                            <Button type="button" size="sm" variant="outline">
                              {t("ai.openModule")}
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => startChat(m.task)}
                          >
                            {t("ai.askAi")}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {nav === "chat" ? (
            <AiChatWorkspace
              initialTask={activeTask}
              onTaskChange={setActiveTask}
            />
          ) : null}

          {nav === "history" ? (
            <section className="rounded-[20px] border border-dm-line bg-dm-surface p-6">
              <h2 className="font-display text-2xl font-semibold text-dm-ink">
                {t("ai.navHistory")}
              </h2>
              <p className="mt-2 text-sm text-dm-muted">{t("ai.historyPending")}</p>
              <p className="mt-4 text-xs text-dm-champagne">
                {t("ai.historySessionNote")}
              </p>
              <div className="mt-6">
                <Button type="button" onClick={() => startChat()}>
                  {t("ai.ctaStartChat")}
                </Button>
              </div>
            </section>
          ) : null}

          {nav === "privacy" ? (
            <section className="rounded-[20px] border border-dm-line bg-dm-surface p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-dm-ink">
                {t("ai.navPrivacy")}
              </h2>
              <p className="text-sm text-dm-muted">{t("ai.privacyBody")}</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-dm-ink">
                <li>{t("ai.privacyNoJournal")}</li>
                <li>{t("ai.privacyNoChat")}</li>
                <li>{t("ai.privacyConsent")}</li>
              </ul>
              <Link href="/legal/ai" className="inline-flex">
                <Button type="button" variant="outline">
                  {t("ai.policyLink")}
                </Button>
              </Link>
              <Link href="/me/privacy" className="ml-2 inline-flex">
                <Button type="button">{t("ai.managePrivacy")}</Button>
              </Link>
            </section>
          ) : null}

          {nav === "settings" ? (
            <section className="rounded-[20px] border border-dm-line bg-dm-surface p-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold text-dm-ink">
                {t("ai.navSettings")}
              </h2>
              <p className="text-sm text-dm-muted">{t("ai.settingsBody")}</p>
              <p className="text-xs text-dm-champagne">{t("ai.adapterBadge")}</p>
            </section>
          ) : null}
        </main>

        {/* Context */}
        <aside
          className={
            contextOpen
              ? "rounded-[20px] border border-dm-line bg-dm-surface p-4 shadow-[0_12px_40px_rgba(36,26,28,0.06)] lg:sticky lg:top-4 lg:self-start"
              : "hidden"
          }
        >
          <div className="mb-3 hidden items-center justify-between lg:flex">
            <p className="text-xs font-extrabold uppercase tracking-[1.5px] text-dm-champagne">
              {t("ai.contextHeading")}
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-dm-muted underline"
              onClick={() => setContextOpen(false)}
            >
              {t("ai.hideContext")}
            </button>
          </div>
          <AiContextPanel />
        </aside>
      </div>
    </div>
  );
}
