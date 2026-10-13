import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  HOME_ACTIVITY,
  HOME_ARTICLES,
  HOME_CONCIERGE_PROMPTS,
  HOME_JOURNEY_STEPS,
  HOME_MAP_CARDS,
  HOME_STAT_AVATARS,
  HOME_SUGGESTS,
} from "@/lib/home-fixtures";

export function HomeDashboard({
  displayName,
  profilePct,
  primaryHref,
}: {
  displayName: string;
  profilePct: number;
  primaryHref: string;
}) {
  const journeyDone = profilePct >= 80 ? 3 : profilePct >= 40 ? 2 : 1;

  return (
    <div className="dm-page-frame space-y-6">
      {/* Hero — mockup banner */}
      <section className="relative overflow-hidden rounded-dm-xl shadow-dm">
        <div className="relative min-h-[220px] sm:min-h-[260px]">
          <Image
            src="/fixtures/home/hero-city.jpg"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dm-ink/75 via-dm-deep/45 to-transparent" />
          <div className="relative grid h-full min-h-[220px] gap-4 p-5 sm:min-h-[260px] sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-xl text-white">
              <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-white/80">
                Trang chủ
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
                Xin chào, {displayName}{" "}
                <span className="text-dm-champagne" aria-hidden>
                  ♡
                </span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-[15px]">
                Mỗi kết nối chân thành đều là một bước gần hơn đến câu chuyện đẹp
                của riêng bạn.
              </p>
              <Link
                href={primaryHref}
                className="mt-5 inline-flex items-center rounded-full bg-[#6B2D3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#54212f]"
              >
                Tiếp tục hành trình →
              </Link>
            </div>
            <div className="relative hidden justify-end lg:flex">
              <div className="relative h-44 w-40 overflow-hidden rounded-2xl border-[3px] border-white/80 shadow-lg">
                <Image
                  src="/fixtures/home/hero-portrait.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <p className="absolute -left-2 bottom-2 max-w-[11rem] font-editorial text-sm italic leading-snug text-white drop-shadow-md">
                “Những người đúng đều đến vào thời điểm đẹp.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mức độ hoàn thiện hồ sơ"
          value={`${profilePct}%`}
          footer={
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F4E9E4]">
              <div
                className="h-full rounded-full bg-[#6B2D3C]"
                style={{ width: `${Math.min(100, profilePct)}%` }}
              />
            </div>
          }
        />
        <StatCard
          label="Hồ sơ phù hợp hôm nay"
          value="12"
          avatars
          footer={
            <p className="mt-2 text-xs font-semibold text-[#2F7D4A]">
              +3 so với hôm qua
            </p>
          }
        />
        <StatCard
          label="Lời mời kết nối"
          value="5"
          avatars
          footer={
            <p className="mt-2 text-xs font-semibold text-[#6B2D3C]">+8 tuần này</p>
          }
        />
        <StatCard
          label="Tin nhắn chưa đọc"
          value="3"
          avatars
          footer={
            <Link
              href="/chat"
              className="mt-2 inline-flex text-xs font-semibold text-[#6B2D3C]"
            >
              Mở hộp thư →
            </Link>
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-8">
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#241A1C]">
                  Gợi ý phù hợp cho bạn
                </h2>
              </div>
              <Link
                href="/discover"
                className="shrink-0 text-sm font-semibold text-[#6B2D3C]"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {HOME_SUGGESTS.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-[18px] border border-[#E8DCD4] bg-[#FAF6F3] shadow-[0_8px_24px_rgba(36,26,28,0.06)]"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={p.photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 50vw, 280px"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#6B2D3C] shadow-sm">
                      {p.matchPct}% phù hợp
                    </span>
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#6B2D3C] shadow-sm">
                      ♡
                    </span>
                  </div>
                  <div className="space-y-2.5 p-4">
                    <h3 className="font-display text-lg font-semibold text-[#241A1C]">
                      {p.name}, {p.age}
                    </h3>
                    <p className="text-xs text-dm-muted">
                      {p.city} · {p.distanceKm}km
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.interests.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#F4E9E4] px-2.5 py-1 text-[11px] font-medium text-[#472025]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-dm-muted">
                      {p.bio}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Link
                        href="/discover"
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-[#6B2D3C] px-3 py-2.5 text-xs font-semibold text-white"
                      >
                        Kết nối ngay
                      </Link>
                      <Link
                        href="/discover"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-[#E8DCD4] bg-[#F4E9E4] px-3 py-2.5 text-xs font-semibold text-[#6B2D3C]"
                      >
                        Xem hồ sơ
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl font-semibold text-[#241A1C]">
              Bản đồ hẹn & Kỷ niệm
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {HOME_MAP_CARDS.map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="group overflow-hidden rounded-2xl border border-[#E8DCD4] bg-[#FAF6F3] shadow-sm"
                >
                  <div className="relative aspect-[16/11]">
                    <Image
                      src={c.photo}
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-[1.03]"
                      sizes="240px"
                    />
                  </div>
                  <p className="p-3 text-sm font-semibold text-[#241A1C]">
                    {c.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl font-semibold text-[#241A1C]">
              Bài viết dành cho bạn
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {HOME_ARTICLES.map((a) => (
                <Link
                  key={a.id}
                  href={a.href}
                  className="overflow-hidden rounded-2xl border border-[#E8DCD4] bg-[#FAF6F3] shadow-sm transition hover:border-[#6B2D3C]/40"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={a.photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                  <p className="p-4 font-display text-base font-semibold leading-snug text-[#241A1C]">
                    {a.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-5 lg:col-span-4">
          <section className="rounded-[18px] border border-[#E8DCD4] bg-[#FAF6F3] p-5 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-[#241A1C]">
              Hành trình của bạn
            </h2>
            <ol className="mt-5 flex flex-wrap items-start gap-2 sm:flex-nowrap">
              {HOME_JOURNEY_STEPS.map((step, i) => {
                const done = i < journeyDone;
                const current = i === journeyDone - 1;
                return (
                  <li key={step} className="flex min-w-0 flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      {i > 0 ? (
                        <span
                          className={`h-0.5 flex-1 ${done || current ? "bg-[#6B2D3C]" : "bg-[#E8DCD4]"}`}
                        />
                      ) : (
                        <span className="flex-1" />
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done || current
                            ? "bg-[#6B2D3C] text-white"
                            : "border border-[#E8DCD4] bg-white text-dm-muted"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {i < HOME_JOURNEY_STEPS.length - 1 ? (
                        <span
                          className={`h-0.5 flex-1 ${i < journeyDone - 1 ? "bg-[#6B2D3C]" : "bg-[#E8DCD4]"}`}
                        />
                      ) : (
                        <span className="flex-1" />
                      )}
                    </div>
                    <p className="mt-2 text-[10px] font-medium leading-tight text-dm-muted">
                      {step}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-[18px] border border-[#E8DCD4] bg-[#FAF6F3] p-5 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-[#241A1C]">
              Hoạt động gần đây
            </h2>
            <ul className="mt-4 space-y-3">
              {HOME_ACTIVITY.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <Image src={a.avatar} alt="" fill className="object-cover" sizes="40px" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#241A1C]">{a.text}</p>
                    <p className="text-xs text-dm-muted">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[18px] border border-[#E8DCD4] bg-gradient-to-b from-[#FAF6F3] to-[#F4E9E4] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#A88A62]">
                  DeepMatch Concierge · BETA
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-[#241A1C]">
                  Trợ lý AI của bạn
                </h2>
              </div>
              <span className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow">
                <Image
                  src="/fixtures/home/ai-avatar.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {HOME_CONCIERGE_PROMPTS.map((p) => (
                <Link
                  key={p}
                  href="/ai"
                  className="rounded-full border border-[#E8DCD4] bg-white px-3 py-1.5 text-[11px] font-medium text-[#472025] transition hover:border-[#6B2D3C]"
                >
                  {p}
                </Link>
              ))}
            </div>
            <Link
              href="/ai"
              className="mt-4 flex items-center justify-between rounded-full border border-[#E8DCD4] bg-white px-4 py-3 text-sm text-dm-muted"
            >
              <span>Hỏi DeepMatch bất cứ điều gì…</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6B2D3C] text-white">
                →
              </span>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  footer,
  avatars,
}: {
  label: string;
  value: string;
  footer?: ReactNode;
  avatars?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[#E8DCD4] bg-[#FAF6F3] p-4 shadow-[0_8px_24px_rgba(36,26,28,0.05)]">
      <p className="text-xs font-medium text-dm-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="font-display text-3xl font-semibold text-[#241A1C]">{value}</p>
        {avatars ? (
          <div className="mb-1 flex -space-x-2">
            {HOME_STAT_AVATARS.map((src) => (
              <span
                key={src}
                className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white"
              >
                <Image src={src} alt="" fill className="object-cover" sizes="28px" />
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {footer}
    </div>
  );
}
