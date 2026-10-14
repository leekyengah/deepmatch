export type CoupleInviteEmailResult = {
  ok: boolean;
  delivery: "resend" | "stub";
  error?: string;
};

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://datingvn.com"
  );
}

export function coupleJoinUrl(code: string) {
  const origin = siteOrigin();
  return `${origin}/couple/join?code=${encodeURIComponent(code)}`;
}

/** Send Sánh đôi invite email — Resend when configured, otherwise stub (no throw). */
export async function sendCoupleInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  inviterName: string;
  locale?: string;
}): Promise<CoupleInviteEmailResult> {
  const to = opts.to.trim().toLowerCase();
  const subject =
    opts.locale === "en-US"
      ? `${opts.inviterName} invited you to Couple Space on DeepMatch`
      : `${opts.inviterName} mời bạn Sánh đôi trên DeepMatch`;

  const text =
    opts.locale === "en-US"
      ? [
          `Hi,`,
          ``,
          `${opts.inviterName} invited you to create a private Couple Space on DeepMatch.`,
          `Sign up or log in, then open this link to accept:`,
          opts.inviteUrl,
          ``,
          `The link expires in 48 hours. A mutual like does not create Couple Space.`,
          ``,
          `— DeepMatch`,
        ].join("\n")
      : [
          `Xin chào,`,
          ``,
          `${opts.inviterName} mời bạn tạo không gian Sánh đôi riêng trên DeepMatch.`,
          `Đăng ký hoặc đăng nhập, rồi mở liên kết sau để đồng ý:`,
          opts.inviteUrl,
          ``,
          `Liên kết hết hạn sau 48 giờ. Cùng thích không tự tạo không gian Sánh đôi.`,
          ``,
          `— DeepMatch`,
        ].join("\n");

  const html = `<p>${text.split("\n").join("<br/>")}</p>`;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "DeepMatch <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email:stub] couple_invite", { to, inviteUrl: opts.inviteUrl });
    return { ok: true, delivery: "stub" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email:resend] couple_invite failed", res.status, body);
      return { ok: false, delivery: "resend", error: `resend_${res.status}` };
    }
    return { ok: true, delivery: "resend" };
  } catch (e) {
    console.error("[email:resend] couple_invite error", e);
    return { ok: false, delivery: "resend", error: "network" };
  }
}
