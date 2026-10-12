import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

const STEPS = [
  "confirm",
  "method",
  "qr",
  "processing",
  "success",
  "failed",
] as const;

export default async function CheckoutStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { step } = await params;
  const sp = await searchParams;
  if (!(STEPS as readonly string[]).includes(step)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/checkout/${step}`);
  const { t } = await getServerTranslator();

  return (
    <main className="mx-auto max-w-lg pb-16">
      <Link href="/services" className="text-sm text-dm-muted underline">
        {t("booking.backToServices")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-dm-ink">
        {t("commerce.checkoutTitle")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("commerce.checkoutIntro")}</p>
      <div className="mt-6">
        <CheckoutClient
          step={step as (typeof STEPS)[number]}
          packageCode={sp.package}
        />
      </div>
    </main>
  );
}
