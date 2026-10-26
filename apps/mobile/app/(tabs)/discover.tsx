import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
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

/** M03 — Discovery */
export default function DiscoverScreen() {
  const t = useT();
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const current = items[0];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data: { candidates: Candidate[] } }>(
        "/api/v1/discovery/candidates?page_size=20",
      );
      setItems(res.data.candidates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("discovery.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  if (!current) {
    return (
      <PremiumScreen>
        <PremiumHeader title={t("discovery.title")} />
        <EmptyState title={t("discovery.emptyBody")} />
        <PremiumButton label={t("common.reload")} onPress={load} variant="outline" />
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t("discovery.title")}
        subtitle={t("mobile.compatDisclaimer")}
        right={<MatchScore score={current.score} />}
      />
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
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
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
