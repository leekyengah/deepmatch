import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { getServerTranslator } from "@/lib/i18n/server";
import { DemoCartClient } from "@/components/lifestyle/DemoCartClient";

export default async function LifestyleCartPage() {
  const { t } = await getServerTranslator();
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        {t("commerce.backLifestyle")}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-4xl font-medium text-dm-raspberry">
          {t("commerce.cartDemo")}
        </h1>
        <Badge tone="warn">SANDBOX</Badge>
      </div>
      <p className="mt-2 text-sm text-dm-muted">
        {t("commerce.cartIntro")}
      </p>
      <div className="mt-8">
        <DemoCartClient />
      </div>
    </div>
  );
}
