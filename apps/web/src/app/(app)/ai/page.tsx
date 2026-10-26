import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { AiConciergeHub } from "@/components/ai/AiConciergeHub";

export default async function AiHubPage() {
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div>
      <AnalyticsBeacon event="ai_hub_open" />
      <AiConciergeHub />
    </div>
  );
}
