import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-10">
      <header className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--dm-deep)]">
          DeepMatch
        </p>
        <nav className="flex gap-4 text-sm font-medium text-[var(--dm-deep)]/80">
          <Link href="/signup">Bắt đầu</Link>
          <Link href="/login">Đăng nhập</Link>
          <Link href="/me">Cá nhân</Link>
        </nav>
      </header>

      <section className="relative my-16 overflow-hidden rounded-[2rem] border border-[var(--dm-blush)]/60 bg-white/50 px-8 py-16 backdrop-blur">
        <p className="font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--dm-deep)] md:text-6xl">
          DeepMatch
        </p>
        <h1 className="mt-4 max-w-xl text-xl font-medium text-[var(--dm-deep)]/90 md:text-2xl">
          Kết nối có chủ đích — ghép đôi minh bạch, chat sau mutual, bản đồ chỉ
          của hai người.
        </h1>
        <p className="mt-4 max-w-lg text-[var(--dm-deep)]/70">
          Không điểm “xác suất yêu”. Không tự mở không gian cặp đôi từ một lượt
          thích. Bạn quyết định từng bước.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-[var(--dm-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Tạo tài khoản
          </Link>
          <Link
            href="/couple"
            className="rounded-full border border-[var(--dm-deep)]/20 bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--dm-deep)]"
          >
            Vào Chúng mình
          </Link>
        </div>
      </section>

      <footer className="text-xs text-[var(--dm-deep)]/50">
        Staging scaffold · Feature flags · Không production deploy tự động
      </footer>
    </main>
  );
}
