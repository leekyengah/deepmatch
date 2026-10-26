import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LEGAL_DOCUMENTS,
  getLegalDocument,
  type LegalDocId,
} from "@deepmatch/legal-content";
import { LegalBody } from "@/components/legal/LegalBody";
import { LegalShell } from "@/components/legal/LegalShell";

const SLUGS = LEGAL_DOCUMENTS.filter((d) => d.path.startsWith("/legal/")).map(
  (d) => d.id,
);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDocument(slug as LegalDocId);
  if (!doc) return { title: "Pháp lý — DeepMatch" };
  return {
    title: `${doc.title} — DeepMatch`,
    description: `${doc.title} · DeepMatch chính sách người dùng v1.1`,
  };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getLegalDocument(slug as LegalDocId);
  if (!doc || !doc.path.startsWith("/legal/")) notFound();

  const toc = doc.blocks
    .filter((b): b is { type: "h2"; id: string; text: string } => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));

  return (
    <LegalShell title={doc.title} activeId={doc.id} toc={toc}>
      <LegalBody blocks={doc.blocks} />
      {doc.id === "delete-account" ? (
        <p className="mt-8 rounded-xl bg-dm-surface px-4 py-3 text-sm">
          Thực hiện yêu cầu xóa trên web:{" "}
          <Link href="/account-deletion" className="font-semibold text-dm-primary underline">
            mở trang xóa tài khoản
          </Link>{" "}
          (cần đăng nhập). Quản lý thuê bao tại kênh đã mua — xem{" "}
          <Link href="/legal/subscriptions" className="underline">
            Thuê bao & hoàn tiền
          </Link>
          .
        </p>
      ) : null}
      <p className="mt-10 text-sm">
        <Link href="/legal" className="text-dm-primary underline">
          ← Trung tâm pháp lý
        </Link>
      </p>
    </LegalShell>
  );
}
