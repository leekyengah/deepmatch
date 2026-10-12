"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useEffect, useState } from "react";
import { formatDateTime } from "@deepmatch/i18n";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Contact = {
  id: string;
  display_name: string;
  channel: string;
  contact_value: string;
};

type Checkin = {
  id: string;
  window_ends_at: string;
  share_approx_location: boolean;
  note: string | null;
  completed_at: string | null;
};

export function DeepSafeClient() {
  const t = useT();
  const { locale } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const [c, k] = await Promise.all([
      fetch("/api/v1/safety/contacts").then((r) => r.json()),
      fetch("/api/v1/safety/checkins").then((r) => r.json()),
    ]);
    if (c.ok) setContacts(c.contacts ?? []);
    if (k.ok) setCheckins(k.checkins ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addContact() {
    const res = await fetch("/api/v1/safety/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: name,
        contact_value: value,
        channel: "phone",
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(resolveApiErrorMessage(json, t, "safety.genericError"));
      return;
    }
    setName("");
    setValue("");
    await refresh();
  }

  async function startCheckin() {
    const res = await fetch("/api/v1/safety/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 120, share_approx_location: false }),
    });
    const json = await res.json();
    setMsg(json.note ?? json?.error?.message ?? null);
    await refresh();
  }

  async function complete(id: string) {
    await fetch("/api/v1/safety/checkins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-2 text-sm">
        <p className="font-semibold text-dm-raspberry">{t("safety.contacts")}</p>
        <Input
          placeholder={t("safety.contactName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder={t("safety.contactValue")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="button" size="sm" onClick={() => void addContact()}>
          {t("safety.addContact")}
        </Button>
        <ul className="mt-3 space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex justify-between gap-2 text-xs">
              <span>
                {c.display_name} · {c.contact_value}
              </span>
              <button
                type="button"
                className="underline text-dm-danger"
                onClick={() =>
                  void fetch(`/api/v1/safety/contacts?id=${c.id}`, {
                    method: "DELETE",
                  }).then(refresh)
                }
              >
                {t("safety.removeContact")}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3 text-sm">
        <p className="font-semibold text-dm-raspberry">
          {t("safety.checkInVoluntary")}
        </p>
        <p className="text-xs text-dm-muted">{t("safety.checkInHint")}</p>
        <Button type="button" size="sm" onClick={() => void startCheckin()}>
          {t("safety.startWindow")}
        </Button>
        <ul className="space-y-2">
          {checkins.map((c) => (
            <li key={c.id} className="rounded-dm border border-dm-line p-3 text-xs">
              <p>
                {t("safety.expiresAt", {
                  when: formatDateTime(c.window_ends_at, locale),
                })}
              </p>
              <p>
                {c.completed_at
                  ? t("safety.completedAt", {
                      when: formatDateTime(c.completed_at, locale),
                    })
                  : t("safety.notCompleted")}
              </p>
              {!c.completed_at ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => void complete(c.id)}
                >
                  {t("safety.imOk")}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="text-sm">
        <p className="font-semibold text-dm-raspberry">
          {t("safety.demoCoordTitle")}
        </p>
        <p className="mt-1 text-xs text-dm-muted">{t("safety.demoCoordBody")}</p>
        <a href="/lifestyle/safety" className="mt-2 inline-block text-sm underline">
          {t("safety.demoCatalogLink")}
        </a>
      </Card>

      <p className="text-xs text-dm-muted">{t("safety.noGuarantee")}</p>

      {msg ? <p className="text-xs text-dm-muted">{msg}</p> : null}
    </div>
  );
}
