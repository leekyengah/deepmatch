import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiGet, apiPost, type Candidate } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  ErrorState,
  MatchScore,
  PremiumButton,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

type IntentId = "all" | "friendship" | "dating" | "marriage";

type Filters = {
  intent: IntentId;
  minAge: string;
  maxAge: string;
  region: string;
  q: string;
  strict: boolean;
};

const DEFAULT_FILTERS: Filters = {
  intent: "all",
  minAge: "18",
  maxAge: "99",
  region: "",
  q: "",
  strict: false,
};

/** M03 — Discovery with Web-parity filters */
export default function DiscoverScreen() {
  const t = useT();
  const [items, setItems] = useState<Candidate[]>([]);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const current = items[0];

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page_size", "20");
    if (filters.intent !== "all") p.set("intent", filters.intent);
    if (filters.minAge) p.set("min_age", filters.minAge);
    if (filters.maxAge) p.set("max_age", filters.maxAge);
    if (filters.region.trim()) p.set("region", filters.region.trim());
    if (filters.q.trim()) p.set("q", filters.q.trim());
    if (filters.strict) p.set("strict", "1");
    return p.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{
        data: { candidates: Candidate[]; emptyReason?: string | null };
      }>(`/api/v1/discovery/candidates?${query}`);
      setItems(res.data.candidates ?? []);
      setEmptyReason(res.data.emptyReason ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("discovery.loadError"));
    } finally {
      setLoading(false);
    }
  }, [query, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function act(action: "like" | "pass") {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await apiPost<{ mutual?: boolean }>("/api/v1/likes", {
        targetId: current.userId,
        action,
      });
      setItems((prev) => prev.slice(1));
      if (res.mutual) {
        Alert.alert(
          t("discovery.mobileMatchTitle"),
          t("discovery.mobileMatchBody", { name: current.displayName }),
        );
      }
    } catch (e) {
      Alert.alert(
        t("common.errorGeneric"),
        e instanceof Error ? e.message : t("discovery.actionFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  function applyFilters() {
    setFilters({ ...draft });
    setFiltersOpen(false);
  }

  function resetFilters() {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setFiltersOpen(false);
  }

  const intents: Array<{ id: IntentId; label: string }> = [
    { id: "all", label: t("discovery.intentAll") },
    { id: "friendship", label: t("discovery.intentFriendship") },
    { id: "dating", label: t("discovery.intentDating") },
    { id: "marriage", label: t("discovery.intentMarriage") },
  ];

  if (loading) {
    return (
      <PremiumScreen>
        <SkeletonLoader />
      </PremiumScreen>
    );
  }

  if (error) {
    return (
      <PremiumScreen>
        <ErrorState message={error} onRetry={load} retryLabel={t("mobile.retry")} />
      </PremiumScreen>
    );
  }

  const emptyCopy =
    emptyReason === "MEDIA_GATE"
      ? t("discovery.emptyMediaGate")
      : emptyReason === "FILTERS_STRICT"
        ? t("discovery.emptyFilters")
        : t("discovery.emptyBody");

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t("discovery.title")}
        subtitle={t("mobile.compatDisclaimer")}
        right={
          current ? <MatchScore score={current.score} /> : undefined
        }
      />

      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setFiltersOpen((v) => !v)}
          style={styles.filterToggle}
          accessibilityRole="button"
        >
          <Text style={styles.filterToggleText}>{t("discovery.filters")}</Text>
        </Pressable>
        <Pressable onPress={resetFilters} accessibilityRole="button">
          <Text style={styles.resetText}>{t("discovery.relaxFilters")}</Text>
        </Pressable>
      </View>

      {filtersOpen ? (
        <View style={styles.filterPanel}>
          <View style={styles.intentRow}>
            {intents.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setDraft((d) => ({ ...d, intent: tab.id }))}
                style={[
                  styles.intentChip,
                  draft.intent === tab.id && styles.intentChipOn,
                ]}
              >
                <Text
                  style={[
                    styles.intentChipText,
                    draft.intent === tab.id && styles.intentChipTextOn,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={draft.q}
            onChangeText={(q) => setDraft((d) => ({ ...d, q }))}
            placeholder={t("discovery.searchPh")}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <View style={styles.ageRow}>
            <TextInput
              value={draft.minAge}
              onChangeText={(minAge) => setDraft((d) => ({ ...d, minAge }))}
              keyboardType="number-pad"
              placeholder="18"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.ageInput]}
            />
            <Text style={styles.ageSep}>–</Text>
            <TextInput
              value={draft.maxAge}
              onChangeText={(maxAge) => setDraft((d) => ({ ...d, maxAge }))}
              keyboardType="number-pad"
              placeholder="99"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.ageInput]}
            />
          </View>
          <TextInput
            value={draft.region}
            onChangeText={(region) => setDraft((d) => ({ ...d, region }))}
            placeholder={t("onboarding.fuzzyRegionPlaceholder")}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable
            onPress={() => setDraft((d) => ({ ...d, strict: !d.strict }))}
            style={styles.strictRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft.strict }}
          >
            <Text style={styles.strictText}>
              {draft.strict ? "☑" : "☐"} {t("discovery.strictFilters")}
            </Text>
          </Pressable>
          <PremiumButton label={t("discovery.applyFilters")} onPress={applyFilters} />
        </View>
      ) : null}

      {!current ? (
        <>
          <EmptyState title={emptyCopy} />
          {emptyReason === "MEDIA_GATE" ? (
            <PremiumButton
              label={t("discovery.openMediaGate")}
              onPress={() => router.push("/me/media" as never)}
            />
          ) : (
            <PremiumButton
              label={t("common.reload")}
              onPress={load}
              variant="outline"
            />
          )}
        </>
      ) : (
        <>
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/profile/${current.userId}` as never)}
            accessibilityRole="button"
            accessibilityLabel={t("mobile.profileDetail")}
          >
            <Text style={styles.name}>{current.displayName}</Text>
            <Text style={styles.region}>
              {current.fuzzyRegion || t("discovery.fuzzyRegion")}
            </Text>
            <Text style={styles.compat}>
              {t("mobile.compatLabel", {
                score: Math.round(
                  current.score <= 1 ? current.score * 100 : current.score,
                ),
              })}
            </Text>
            <Text style={styles.tags}>
              {(current.interests ?? []).slice(0, 6).join(" · ") ||
                t("discovery.defaultReason")}
            </Text>
          </Pressable>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <PremiumButton
                label={t("discovery.pass")}
                onPress={() => act("pass")}
                variant="outline"
                disabled={busy}
              />
            </View>
            <View style={{ width: spacing[3] }} />
            <View style={{ flex: 1 }}>
              <PremiumButton
                label={t("discovery.like")}
                onPress={() => act("like")}
                disabled={busy}
              />
            </View>
          </View>
        </>
      )}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  filterToggle: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: layout.radiusMd,
    backgroundColor: colors.blush,
  },
  filterToggleText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  resetText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  filterPanel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: layout.radiusLg,
    padding: spacing[3],
    marginBottom: spacing[3],
    backgroundColor: colors.panel,
    gap: spacing[2],
  },
  intentRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  intentChip: {
    borderRadius: 999,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.blush,
  },
  intentChipOn: { backgroundColor: colors.primary },
  intentChipText: { fontSize: 12, fontWeight: "600", color: colors.primary },
  intentChipTextOn: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: layout.radiusMd,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.ink,
    backgroundColor: "#fff",
  },
  ageRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  ageInput: { flex: 1 },
  ageSep: { color: colors.muted },
  strictRow: { paddingVertical: spacing[1] },
  strictText: { color: colors.ink, fontSize: 13 },
  card: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: layout.radiusXl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[6],
    marginVertical: spacing[4],
    justifyContent: "flex-end",
  },
  name: { fontSize: 32, fontWeight: "700", color: colors.primary },
  region: { marginTop: spacing[2], color: colors.muted },
  compat: { marginTop: spacing[2], color: colors.champagne, fontWeight: "700" },
  tags: { marginTop: spacing[3], color: colors.ink, lineHeight: 22 },
  row: { flexDirection: "row", marginBottom: spacing[6] },
});
