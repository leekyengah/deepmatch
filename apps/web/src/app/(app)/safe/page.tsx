import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { DeepSafeClient } from "@/components/safety/DeepSafeClient";

export default function DeepSafePage() {
  return (
    <div className="max-w-2xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        ← Lifestyle
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        DeepSafe
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Trung tâm an toàn cơ bản — luôn miễn phí. Không thay thế số khẩn cấp địa
        phương.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="good">Core free</Badge>
        <Badge tone="warn">Không phải dịch vụ điều phối thật</Badge>
      </div>
      <div className="mt-8">
        <DeepSafeClient />
      </div>
    </div>
  );
}
