import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { AiAssistClient } from "@/components/ai/AiAssistClient";

export default async function AiHubPage() {
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        ← Lifestyle
      </Link>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        AI Hub
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        Trợ lý có chọn lọc
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Mỗi lần gọi cần đồng ý mục đích. Không tự gửi tin · không chẩn đoán lâm sàng.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="warn">Adapter: stub (chưa LLM trả phí)</Badge>
        <Badge tone="good">Consent bắt buộc</Badge>
      </div>
      <div className="mt-8">
        <AiAssistClient />
      </div>
    </div>
  );
}
