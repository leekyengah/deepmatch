import Link from "next/link";
import type { Metadata } from "next";
import {
  LEGAL_DOCUMENTS,
  LEGAL_PACK_META,
  legalNavItems,
} from "@deepmatch/legal-content";
import { LegalBody } from "@/components/legal/LegalBody";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Trung tâm pháp lý — DeepMatch",
  description:
    "Bộ chính sách dành cho người dùng DeepMatch: điều khoản, quyền riêng tư, cộng đồng, AI, thuê bao và hỗ trợ.",
};

export default function LegalIndexPage() {
  const nav = legalNavItems();

  return (
    <LegalShell title={LEGAL_PACK_META.title}>
      <LegalBody blocks={LEGAL_PACK_META.intro} />
      <h2 className="mt-8 font-display text-2xl text-dm-raspberry">
        Các phần chính sách
      </h2>
      <ul className="mt-4 space-y-3">
        {nav.map((item) => {
          const doc = LEGAL_DOCUMENTS.find((d) => d.id === item.id);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group block rounded-xl border border-dm-line bg-dm-surface/60 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dm-primary"
              >
                <span className="font-semibold text-dm-raspberry group-hover:underline">
                  {doc?.sourcePart ? `${doc.sourcePart}. ` : ""}
                  {item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-8 text-sm text-dm-muted">
        Để gửi yêu cầu xóa tài khoản trên web (cần đăng nhập):{" "}
        <Link href="/account-deletion" className="text-dm-primary underline">
          /account-deletion
        </Link>
      </p>
    </LegalShell>
  );
}
