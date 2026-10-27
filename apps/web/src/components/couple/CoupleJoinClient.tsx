"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

export function CoupleJoinClient({ code }: { code: string }) {
  const t = useT();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function accept() {
      try {
        const res = await fetch("/api/v1/couple-invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const json = (await res.json()) as {
          error?: string | { message?: string };
          pairId?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setFailed(true);
          setMessage(
            typeof json.error === "string"
              ? json.error
              : (json.error?.message ?? t("couple.acceptFailed")),
          );
          return;
        }
        setMessage(t("couple.acceptedSpace"));
        router.replace("/couple/map");
        router.refresh();
      } catch {
        if (!cancelled) {
          setFailed(true);
          setMessage(t("couple.acceptFailed"));
        }
      }
    }
    void accept();
    return () => {
      cancelled = true;
    };
  }, [code, router, t]);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-dm-muted" role="status">
        {message ?? t("couple.joinWorking")}
      </p>
      {failed ? (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              setFailed(false);
              setMessage(null);
              window.location.reload();
            }}
          >
            {t("common.retry")}
          </Button>
          <a href="/couple/invite">
            <Button type="button" variant="outline">
              {t("couple.invite")}
            </Button>
          </a>
        </div>
      ) : null}
    </div>
  );
}
