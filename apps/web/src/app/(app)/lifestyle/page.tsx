import Link from "next/link";
import { redirect } from "next/navigation";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const pillars = [
  { href: "/lifestyle/gift", label: "DeepGift", desc: "Quà tặng mẫu DEMO" },
  { href: "/lifestyle/fashion", label: "DeepStyle", desc: "Thời trang mẫu DEMO" },
  { href: "/lifestyle/beauty", label: "DeepBeauty", desc: "Makeup mẫu DEMO" },
  { href: "/lifestyle/venue", label: "DeepDate", desc: "Địa điểm hẹn mẫu" },
  { href: "/lifestyle/travel", label: "DeepTravel", desc: "Du lịch mẫu DEMO" },
  { href: "/safe", label: "DeepSafe", desc: "Check-in & người tin cậy (miễn phí)" },
  { href: "/lifestyle/safety", label: "DeepSafe catalog", desc: "Quy trình mẫu DEMO" },
  { href: "/lifestyle/orders", label: "Lệnh DEMO", desc: "Reserve / confirm / cancel sandbox" },
  { href: "/ai", label: "AI Hub", desc: "Gợi ý có đồng ý rõ ràng" },
  { href: "/ai/deepmind", label: "DeepMind", desc: "Tự phản ánh tự nguyện" },
];

export default async function LifestyleHomePage() {
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-dm-primary">
        Lifestyle · DEMO
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-dm-raspberry">
        Không gian Lifestyle
      </h1>
      <p className="mt-2 text-sm text-dm-muted">
        Catalog 60 mẫu sandbox. Không đặt chỗ, giao hàng hay thanh toán thật.
      </p>
      <div className="mt-4">
        <Badge tone="warn">
          BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT
        </Badge>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {pillars.map((p) => (
          <Link key={p.href} href={p.href}>
            <Card className="h-full text-sm transition hover:border-dm-primary">
              <p className="font-semibold text-dm-raspberry">{p.label}</p>
              <p className="mt-1 text-dm-muted">{p.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
