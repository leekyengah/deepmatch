import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CoupleEmptyOnboarding({
  labels,
}: {
  labels: {
    title: string;
    body: string;
    benefitMemories: string;
    benefitMap: string;
    benefitPlans: string;
    inviteCta: string;
    codeCta: string;
  };
}) {
  const benefits = [
    labels.benefitMemories,
    labels.benefitMap,
    labels.benefitPlans,
  ];

  return (
    <section className="mx-auto max-w-2xl rounded-[22px] border border-dm-line bg-dm-panel p-6 shadow-dm sm:p-10">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-champagne">
        Sánh đôi
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-dm-ink sm:text-4xl">
        {labels.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-dm-muted sm:text-base">
        {labels.body}
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {benefits.map((b) => (
          <li
            key={b}
            className="rounded-2xl border border-dm-line bg-dm-surface px-4 py-5 text-sm font-medium text-dm-ink"
          >
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/couple/invite" className="sm:flex-1">
          <Button type="button" className="w-full">
            {labels.inviteCta}
          </Button>
        </Link>
        <Link href="/couple/invite#accept" className="sm:flex-1">
          <Button type="button" variant="outline" className="w-full">
            {labels.codeCta}
          </Button>
        </Link>
      </div>
    </section>
  );
}
