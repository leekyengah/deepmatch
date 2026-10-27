"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import {
  COMPANION_PACKAGES,
  formatVnd,
  type CompanionPackage,
} from "@/lib/companion-packages";
import { Button } from "@/components/ui/Button";

type Answers = {
  goal: "listen" | "experience" | "goals" | "match" | "life" | "exclusive" | "";
  format: "online" | "in_person" | "either" | "";
  intensity: "light" | "medium" | "high" | "";
  horizon: "once" | "month" | "quarter" | "half" | "";
  budget: "under1" | "1to5" | "5to20" | "20plus" | "skip" | "";
};

function scorePackage(pkg: CompanionPackage, a: Answers): number {
  let s = 0;
  if (a.goal === "listen" && pkg.code === "CMP-01") s += 5;
  if (a.goal === "experience" && pkg.code === "CMP-02") s += 5;
  if (a.goal === "goals" && (pkg.code === "CMP-03" || pkg.code === "CMP-04"))
    s += 4;
  if (a.goal === "match" && pkg.code === "MAT-01") s += 5;
  if (a.goal === "life" && pkg.code === "MAT-02") s += 5;
  if (a.goal === "exclusive" && pkg.code === "MAT-03") s += 5;
  if (a.intensity === "high" && pkg.group === "matchmaking") s += 2;
  if (a.intensity === "light" && pkg.code === "CMP-01") s += 2;
  if (a.horizon === "once" && (pkg.code === "CMP-01" || pkg.code === "CMP-02"))
    s += 2;
  if (a.horizon === "month" && pkg.code.startsWith("CMP")) s += 1;
  if (a.horizon === "quarter" && pkg.code === "MAT-02") s += 2;
  if (a.horizon === "half" && pkg.code === "MAT-03") s += 2;
  if (a.budget === "under1" && pkg.salePriceVnd <= 500_000) s += 2;
  if (a.budget === "1to5" && pkg.salePriceVnd <= 5_000_000) s += 1;
  if (a.budget === "5to20" && pkg.salePriceVnd <= 20_000_000) s += 1;
  if (a.budget === "20plus" && pkg.salePriceVnd > 20_000_000) s += 2;
  if (a.format === "in_person" && pkg.code === "CMP-02") s += 1;
  return s;
}

export function RecommendWizard() {
  const t = useT();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    goal: "",
    format: "",
    intensity: "",
    horizon: "",
    budget: "",
  });

  const ranked = useMemo(() => {
    return [...COMPANION_PACKAGES]
      .map((p) => ({ pkg: p, score: scorePackage(p, answers) }))
      .sort((a, b) => b.score - a.score);
  }, [answers]);

  const primary = ranked[0]?.pkg;
  const alts = ranked.slice(1, 3).map((r) => r.pkg);

  const steps = [
    {
      key: "goal" as const,
      title: t("booking.wizGoal"),
      options: [
        ["listen", t("booking.wizGoalListen")],
        ["experience", t("booking.wizGoalExp")],
        ["goals", t("booking.wizGoalGoals")],
        ["match", t("booking.wizGoalMatch")],
        ["life", t("booking.wizGoalLife")],
        ["exclusive", t("booking.wizGoalExclusive")],
      ] as const,
    },
    {
      key: "format" as const,
      title: t("booking.wizFormat"),
      options: [
        ["online", t("booking.wizFormatOnline")],
        ["in_person", t("booking.wizFormatInPerson")],
        ["either", t("booking.wizFormatEither")],
      ] as const,
    },
    {
      key: "intensity" as const,
      title: t("booking.wizIntensity"),
      options: [
        ["light", t("booking.wizIntensityLight")],
        ["medium", t("booking.wizIntensityMed")],
        ["high", t("booking.wizIntensityHigh")],
      ] as const,
    },
    {
      key: "horizon" as const,
      title: t("booking.wizHorizon"),
      options: [
        ["once", t("booking.wizHorizonOnce")],
        ["month", t("booking.wizHorizonMonth")],
        ["quarter", t("booking.wizHorizonQuarter")],
        ["half", t("booking.wizHorizonHalf")],
      ] as const,
    },
    {
      key: "budget" as const,
      title: t("booking.wizBudget"),
      options: [
        ["under1", t("booking.wizBudget1")],
        ["1to5", t("booking.wizBudget2")],
        ["5to20", t("booking.wizBudget3")],
        ["20plus", t("booking.wizBudget4")],
        ["skip", t("booking.wizBudgetSkip")],
      ] as const,
    },
  ];

  if (step >= steps.length) {
    return (
      <div className="dm-page-frame dm-page-frame--narrow space-y-6 pb-16">
        <Link href="/services" className="text-sm text-dm-muted underline">
          {t("booking.backToServices")}
        </Link>
        <h1 className="font-display text-3xl font-semibold text-dm-ink">
          {t("booking.wizResultTitle")}
        </h1>
        <p className="text-sm text-dm-muted">{t("booking.wizResultHint")}</p>
        {primary ? (
          <div className="rounded-[18px] border border-dm-line bg-dm-panel p-5 shadow-dm">
            <p className="text-xs font-bold uppercase tracking-wide text-dm-champagne">
              {t("booking.wizPrimary")}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-dm-ink">
              {primary.titleVi} · {primary.code}
            </h2>
            <p className="mt-2 text-sm text-dm-muted">{primary.suitableVi}</p>
            <p className="mt-3 font-bold text-dm-primary">
              {formatVnd(primary.salePriceVnd)}
            </p>
            <p className="mt-2 text-xs text-dm-muted">
              {t("booking.wizReason")} {primary.benefitsVi.split(";")[0]}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/services/${primary.slug}`}>
                <Button type="button">{t("booking.viewPackage")}</Button>
              </Link>
              <Link href={`/services/${primary.slug}/request`}>
                <Button type="button" variant="outline">
                  {t("booking.requestCta")}
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
        {alts.length ? (
          <div>
            <p className="text-sm font-semibold text-dm-ink">
              {t("booking.wizAlts")}
            </p>
            <ul className="mt-3 space-y-2">
              {alts.map((p) => (
                <li key={p.code}>
                  <Link
                    href={`/services/${p.slug}`}
                    className="flex items-center justify-between rounded-xl border border-dm-line px-4 py-3 text-sm hover:border-dm-primary"
                  >
                    <span>
                      {p.titleVi} · {p.code}
                    </span>
                    <span className="font-semibold text-dm-primary">
                      {formatVnd(p.salePriceVnd)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <button
          type="button"
          className="text-sm font-semibold text-dm-primary underline"
          onClick={() => {
            setStep(0);
            setAnswers({
              goal: "",
              format: "",
              intensity: "",
              horizon: "",
              budget: "",
            });
          }}
        >
          {t("booking.wizRestart")}
        </button>
      </div>
    );
  }

  const current = steps[step];

  return (
    <div className="dm-page-frame dm-page-frame--narrow space-y-6 pb-16">
      <Link href="/services" className="text-sm text-dm-muted underline">
        {t("booking.backToServices")}
      </Link>
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        {t("booking.wizEyebrow")} · {step + 1}/{steps.length}
      </p>
      <h1 className="font-display text-3xl font-semibold text-dm-ink">
        {current.title}
      </h1>
      <p className="text-sm text-dm-muted">{t("booking.wizOptional")}</p>
      <div className="space-y-2">
        {current.options.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setAnswers((prev) => ({ ...prev, [current.key]: value }));
              setStep((s) => s + 1);
            }}
            className="block w-full rounded-xl border border-dm-line bg-dm-panel px-4 py-3 text-left text-sm font-semibold text-dm-ink transition hover:border-dm-primary"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="text-sm font-semibold text-dm-muted disabled:opacity-40"
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          className="text-sm font-semibold text-dm-primary"
        >
          {t("booking.wizSkip")}
        </button>
      </div>
    </div>
  );
}
