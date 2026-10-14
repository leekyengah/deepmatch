import { Suspense } from "react";
import { flagEnabled } from "@/lib/flags";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { ChatLounge } from "@/components/chat/ChatLounge";
import { LoadingState } from "@/components/ui/LoadingState";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ChatPage() {
  const { t } = await getServerTranslator();
  const chatEnabled = await flagEnabled("ff_chat");
  return (
    <>
      <AnalyticsBeacon event="chat_open" />
      <Suspense fallback={<LoadingState label={t("chat.opening")} />}>
        <ChatLounge chatEnabled={chatEnabled} />
      </Suspense>
    </>
  );
}
