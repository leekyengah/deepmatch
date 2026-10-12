import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { AiAssistClient } from "@/components/ai/AiAssistClient";

/** EXT-009 — Profile Coach entry (never auto-publish). */
export default async function ProfileCoachPage() {
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/ai" className="text-sm text-dm-muted underline">
        ← AI Hub
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        Profile Coach
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Gợi ý bản nháp — bạn tự chỉnh và lưu ở hồ sơ. AI không tự đăng.
      </p>
      <div className="mt-4">
        <Badge tone="warn">Không auto-publish</Badge>
      </div>
      <div className="mt-8">
        <AiAssistClient />
      </div>
      <p className="mt-6 text-sm">
        <Link href="/me/edit" className="underline">
          Mở chỉnh sửa hồ sơ để lưu thủ công →
        </Link>
      </p>
    </div>
  );
}
