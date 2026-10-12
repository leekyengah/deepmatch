import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { DeepMindClient } from "@/components/ai/DeepMindClient";

export default async function DeepMindPage() {
  if (!(await flagEnabled("ff_ai"))) redirect("/me");

  return (
    <div className="max-w-2xl">
      <Link href="/ai" className="text-sm text-dm-muted underline">
        ← AI Hub
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        DeepMind
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Bộ câu hỏi tự nguyện — không bắt buộc để dùng Tìm nhau.
      </p>
      <div className="mt-4">
        <Badge tone="warn">Không phải chẩn đoán lâm sàng</Badge>
      </div>
      <div className="mt-8">
        <DeepMindClient />
      </div>
    </div>
  );
}
