import { canAccessChat } from "@deepmatch/shared";
import { flagEnabled } from "@/lib/flags";

export default function ChatPage() {
  const access = canAccessChat({
    isAuthenticated: true,
    isMutualMatch: false,
    isParticipant: true,
    isBlockedEitherWay: false,
    chatFlagEnabled: flagEnabled("ff_chat"),
    userSuspended: false,
  });

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Chat</h1>
      <p className="mt-3 text-sm opacity-70">
        Chat chỉ mở sau mutual like hợp lệ. Demo gate hiện tại:{" "}
        <strong>{access.allowed ? "allowed" : access.reason}</strong>
      </p>
      {!access.allowed && (
        <p className="mt-6 rounded-2xl bg-white/80 p-4 text-sm">
          QA05: không thể gửi/nhận khi chưa mutual (`mutual_required`).
        </p>
      )}
    </main>
  );
}
