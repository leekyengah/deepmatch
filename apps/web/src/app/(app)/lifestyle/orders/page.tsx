import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { flagEnabled } from "@/lib/flags";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DemoBookingActions } from "@/components/lifestyle/DemoBookingActions";

export default async function LifestyleOrdersPage() {
  if (!(await flagEnabled("ff_lifestyle"))) redirect("/me");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("commerce_demo_bookings")
    .select(
      "id, status, quote_vnd, created_at, commerce_products(title, mock_id, category)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className="max-w-2xl">
      <Link href="/lifestyle" className="text-sm text-dm-muted underline">
        ← Lifestyle
      </Link>
      <h1 className="mt-4 font-display text-4xl font-medium text-dm-raspberry">
        Lệnh DEMO
      </h1>
      <div className="mt-4">
        <Badge tone="warn">Sandbox — không thanh toán / giao hàng thật</Badge>
      </div>
      {!bookings?.length ? (
        <div className="mt-10">
          <EmptyState
            title="Chưa có lệnh DEMO"
            description="Mở một sản phẩm Lifestyle và bấm Yêu cầu DEMO."
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {bookings.map((b) => {
            const p = b.commerce_products as {
              title?: string;
              mock_id?: string;
              category?: string;
            } | null;
            return (
              <li key={b.id}>
                <Card className="text-sm">
                  <p className="font-semibold text-dm-raspberry">
                    {p?.title ?? "Sản phẩm"}
                  </p>
                  <p className="text-xs text-dm-muted">
                    {p?.mock_id} · {b.status} ·{" "}
                    {b.quote_vnd.toLocaleString("vi-VN")}₫
                  </p>
                  <DemoBookingActions
                    id={b.id}
                    status={b.status}
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
