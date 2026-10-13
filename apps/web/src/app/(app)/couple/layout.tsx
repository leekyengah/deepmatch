import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCoupleId } from "@/lib/couple";
import { CoupleSubNav } from "@/components/couple/CoupleSubNav";

export default async function CoupleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const coupleId = await getActiveCoupleId(user.id);

  return (
    <div className="-mx-1 space-y-5 sm:mx-0">
      <CoupleSubNav hasCouple={Boolean(coupleId)} />
      {children}
    </div>
  );
}
