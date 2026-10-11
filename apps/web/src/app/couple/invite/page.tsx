"use client";

import { useState } from "react";
import Link from "next/link";

export default function CoupleInvitePage() {
  const [code, setCode] = useState<string | null>(null);
  const [acceptCode, setAcceptCode] = useState("");
  const [message, setMessage] = useState("");

  async function createInvite() {
    setMessage("");
    const res = await fetch("/api/pairs/invites", { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "failed");
      return;
    }
    setCode(json.code);
    setMessage(`Hết hạn: ${json.expires_at}`);
  }

  async function acceptInvite() {
    setMessage("");
    const res = await fetch("/api/pairs/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: acceptCode }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "failed");
      return;
    }
    setMessage(`Đã tạo pair ${json.pairId} (không auto từ mutual like)`);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/couple" className="text-sm opacity-60">
        ← Chúng mình
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Lời mời cặp đôi</h1>
      <p className="mt-2 text-sm opacity-70">
        Mã một lần, có hạn, chỉ hash lưu DB. Cần đồng ý hai phía.
      </p>
      <button
        type="button"
        onClick={createInvite}
        className="mt-6 rounded-full bg-[var(--dm-primary)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Tạo mã mời
      </button>
      {code && (
        <p className="mt-4 break-all rounded-2xl bg-white/80 p-4 text-sm">
          Mã (chỉ hiện một lần): <strong>{code}</strong>
        </p>
      )}
      <div className="mt-8 space-y-3">
        <input
          value={acceptCode}
          onChange={(e) => setAcceptCode(e.target.value)}
          placeholder="Dán mã mời"
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={acceptInvite}
          className="rounded-full border px-5 py-2.5 text-sm font-semibold"
        >
          Chấp nhận mời
        </button>
      </div>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  );
}
