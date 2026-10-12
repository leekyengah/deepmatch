"use client";

import { useEffect, useState } from "react";
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
      setMsg(json?.error?.message ?? "Lỗi");
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
        <p className="font-semibold text-dm-raspberry">Người tin cậy</p>
        <Input
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="SĐT / kênh liên hệ"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="button" size="sm" onClick={() => void addContact()}>
          Thêm
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
                Xóa
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3 text-sm">
        <p className="font-semibold text-dm-raspberry">Check-in tự nguyện</p>
        <p className="text-xs text-dm-muted">
          Miễn phí · cửa sổ thời gian · không GPS nền · không điều phối khẩn cấp.
        </p>
        <Button type="button" size="sm" onClick={() => void startCheckin()}>
          Bắt đầu cửa sổ 2 giờ
        </Button>
        <ul className="space-y-2">
          {checkins.map((c) => (
            <li key={c.id} className="rounded-dm border border-dm-line p-3 text-xs">
              <p>
                Hết hạn: {new Date(c.window_ends_at).toLocaleString("vi-VN")}
              </p>
              <p>
                {c.completed_at
                  ? `Đã check-in ${new Date(c.completed_at).toLocaleString("vi-VN")}`
                  : "Chưa hoàn tất"}
              </p>
              {!c.completed_at ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => void complete(c.id)}
                >
                  Tôi ổn — hoàn tất
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="text-sm">
        <p className="font-semibold text-dm-raspberry">Điều phối mẫu (DEMO)</p>
        <p className="mt-1 text-xs text-dm-muted">
          Không có nhân viên / xe / hộ tống thật trên staging. Dùng catalog An toàn
          trong Lifestyle để xem quy trình mô phỏng.
        </p>
        <a href="/lifestyle/safety" className="mt-2 inline-block text-sm underline">
          Xem mẫu DeepSafe catalog →
        </a>
      </Card>

      {msg ? <p className="text-xs text-dm-muted">{msg}</p> : null}
    </div>
  );
}
