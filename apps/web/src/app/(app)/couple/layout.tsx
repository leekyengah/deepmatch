import { CoupleNav } from "@/components/couple/CoupleNav";

export default function CoupleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <CoupleNav />
      {children}
    </div>
  );
}
