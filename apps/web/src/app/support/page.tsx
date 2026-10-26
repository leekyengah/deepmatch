import Link from "next/link";
import type { Metadata } from "next";
import { getLegalDocument } from "@deepmatch/legal-content";
import { LegalBody } from "@/components/legal/LegalBody";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Hỗ trợ và khiếu nại — DeepMatch",
  description: "Hỗ trợ, khiếu nại và cập nhật chính sách DeepMatch.",
};

export default function SupportPage() {
  const doc = getLegalDocument("support");
  if (!doc) return null;

  const toc = doc.blocks
    .filter((b): b is { type: "h2"; id: string; text: string } => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));

  const publishedContact = process.env.NEXT_PUBLIC_SUPPORT_CONTACT?.trim();

  return (
    <LegalShell title={doc.title} activeId="support" toc={toc}>
      <LegalBody blocks={doc.blocks} />

      <section className="mt-8 space-y-3 rounded-xl border border-dm-line bg-dm-surface/70 p-4 text-sm">
        <h2 className="font-semibold text-dm-raspberry">Cách gửi yêu cầu hiện có</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Trong ứng dụng / web đã đăng nhập: dùng công cụ báo cáo hoặc chặn tại
            màn hình liên quan; quản lý quyền riêng tư tại{" "}
            <Link href="/me/privacy" className="underline">
              /me/privacy
            </Link>
            .
          </li>
          <li>
            Xóa tài khoản:{" "}
            <Link href="/account-deletion" className="underline">
              /account-deletion
            </Link>{" "}
            hoặc hướng dẫn tại{" "}
            <Link href="/legal/delete-account" className="underline">
              /legal/delete-account
            </Link>
            .
          </li>
          <li>
            Không gửi mật khẩu, OTP, số thẻ đầy đủ hoặc mã bảo mật qua bất kỳ kênh
            hỗ trợ nào.
          </li>
        </ul>
        {publishedContact ? (
          <p>
            Kênh liên hệ đã công bố:{" "}
            <span className="font-medium">{publishedContact}</span>
          </p>
        ) : (
          <p className="text-dm-muted">
            Kênh liên hệ công khai ngoài tài khoản sẽ được hiển thị tại đây khi
            bên vận hành công bố thông tin nhận diện và đầu mối hỗ trợ (chưa
            điền trong cấu hình triển khai hiện tại).
          </p>
        )}
      </section>

      <p className="mt-10 text-sm">
        <Link href="/legal" className="text-dm-primary underline">
          ← Trung tâm pháp lý
        </Link>
      </p>
    </LegalShell>
  );
}
