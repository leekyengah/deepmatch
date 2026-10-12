"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

function splitList(raw: string) {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Initial = {
  fuzzy_region: string;
  discovery_opt_in: boolean;
  goals: string;
  values: string;
  interests: string;
  communication_style: string;
  expectations: string;
  dealbreakers: string;
  min_age: number;
  max_age: number;
  regions: string;
};

export function DeepProfileForm({ initial }: { initial: Initial }) {
  const t = useT();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fuzzy_region: form.fuzzy_region.trim() || undefined,
          discovery_opt_in: form.discovery_opt_in,
          deep: {
            goals: splitList(form.goals),
            values: splitList(form.values),
            interests: splitList(form.interests),
            communication_style: form.communication_style.trim() || undefined,
            expectations: form.expectations.trim() || undefined,
            dealbreakers: splitList(form.dealbreakers),
          },
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        setMessage(resolveApiErrorMessage(json, t, "profile.saveFailed"));
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("match_preferences").upsert({
          user_id: user.id,
          min_age: Number(form.min_age) || 18,
          max_age: Number(form.max_age) || 99,
          regions: splitList(form.regions),
          required_goals: splitList(form.goals),
        });
        if (error) {
          setMessage(t("profile.savePrefsPartial", { error: error.message }));
          return;
        }
      }
      setMessage(t("profile.savedDeep"));
    } finally {
      setBusy(false);
    }
  }

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.discovery_opt_in}
            onChange={(e) => set("discovery_opt_in", e.target.checked)}
          />
          {t("profile.discoveryDeep")}
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.fuzzyRegionShort")}
          <Input
            className="mt-1"
            value={form.fuzzy_region}
            onChange={(e) => set("fuzzy_region", e.target.value)}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-dm-raspberry">
            {t("profile.minAge")}
            <Input
              type="number"
              className="mt-1"
              value={form.min_age}
              onChange={(e) => set("min_age", Number(e.target.value))}
            />
          </label>
          <label className="block text-sm font-semibold text-dm-raspberry">
            {t("profile.maxAge")}
            <Input
              type="number"
              className="mt-1"
              value={form.max_age}
              onChange={(e) => set("max_age", Number(e.target.value))}
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.searchRegions")}
          <Input
            className="mt-1"
            value={form.regions}
            onChange={(e) => set("regions", e.target.value)}
            placeholder={t("profile.fuzzyPlaceholder")}
          />
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.goals")}
          <Input
            className="mt-1"
            value={form.goals}
            onChange={(e) => set("goals", e.target.value)}
            placeholder={t("profile.goalsPlaceholder")}
          />
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.values")}
          <Input
            className="mt-1"
            value={form.values}
            onChange={(e) => set("values", e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.interests")}
          <Input
            className="mt-1"
            value={form.interests}
            onChange={(e) => set("interests", e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.communicationStyle")}
          <Input
            className="mt-1"
            value={form.communication_style}
            onChange={(e) => set("communication_style", e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.expectations")}
          <Textarea
            className="mt-1"
            rows={2}
            value={form.expectations}
            onChange={(e) => set("expectations", e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("profile.dealbreakers")}
          <Input
            className="mt-1"
            value={form.dealbreakers}
            onChange={(e) => set("dealbreakers", e.target.value)}
          />
        </label>

        <Button type="submit" disabled={busy}>
          {busy ? t("profile.saving") : t("profile.saveProfile")}
        </Button>
        {message ? (
          <p className="text-sm text-dm-muted" role="status">
            {message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
