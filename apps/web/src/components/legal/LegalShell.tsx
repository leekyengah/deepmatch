import Link from "next/link";
import type { ReactNode } from "react";
import {
  LEGAL_PACK_META,
  legalNavItems,
  type LegalDocId,
} from "@deepmatch/legal-content";

export function LegalShell({
  title,
  activeId,
  children,
  toc,
}: {
  title: string;
  activeId?: LegalDocId;
  children: ReactNode;
  toc?: { id: string; text: string }[];
}) {
  const nav = legalNavItems();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      <header className="border-b border-dm-line pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dm-primary">
          DeepMatch · Pháp lý
        </p>
        <h1 className="mt-2 font-display text-3xl text-dm-raspberry sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-dm-muted">
          Phiên bản {LEGAL_PACK_META.version} · Ngày cập nhật nội dung:{" "}
          {LEGAL_PACK_META.contentUpdatedLabel}
        </p>
        <p className="mt-1 text-xs text-dm-muted">
          Ngày cập nhật nội dung không đồng nghĩa ngày hiệu lực mở bán dịch vụ.
          Bản tiếng Việt là bản gốc.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav
          aria-label="Mục lục chính sách"
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <Link
            href="/legal"
            className="mb-3 block text-sm font-semibold text-dm-primary underline-offset-2 hover:underline"
          >
            Trung tâm pháp lý
          </Link>
          <ul className="space-y-1 text-sm">
            {nav.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dm-primary ${
                      active
                        ? "bg-dm-surface font-semibold text-dm-raspberry"
                        : "text-dm-ink/85 hover:bg-white/70"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/account-deletion"
                className="block rounded-lg px-3 py-2 text-dm-ink/85 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dm-primary"
              >
                Yêu cầu xóa (đăng nhập)
              </Link>
            </li>
          </ul>
          {toc && toc.length > 0 ? (
            <div className="mt-6 border-t border-dm-line pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dm-muted">
                Trong trang
              </p>
              <ul className="space-y-1 text-xs">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-dm-ink/80 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dm-primary"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </nav>

        <article className="min-w-0 rounded-2xl bg-white/75 p-5 shadow-sm sm:p-8">
          {children}
        </article>
      </div>
    </main>
  );
}
