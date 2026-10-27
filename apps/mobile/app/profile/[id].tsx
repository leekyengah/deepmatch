import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
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
  StatusBadge,
} from "../../components/premium";
import { colors, spacing } from "../../constants/theme";

/** M04 — Profile detail (from discovery candidate list / peer id) */
export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data: { candidates: Candidate[] } }>(
        "/api/v1/discovery/candidates?page_size=40",
      );
      const found = (res.data.candidates ?? []).find((c) => c.userId === id) ?? null;
      setCandidate(found);
      if (!found) setError(t("discovery.emptyBody"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function like() {
    if (!candidate || busy) return;
    setBusy(true);
    try {
      const res = await apiPost<{ mutual?: boolean }>("/api/v1/likes", {
        targetId: candidate.userId,
        action: "like",
      });
      Alert.alert(
        res.mutual ? t("discovery.mobileMatchTitle") : t("mobile.sendLike"),
        res.mutual
          ? t("discovery.mobileMatchBody", { name: candidate.displayName })
          : t("mobile.goalsSaved"),
      );
      if (res.mutual) router.push("/(tabs)/chat");
      else router.back();
    } catch (e) {
      Alert.alert(t("common.errorGeneric"), e instanceof Error ? e.message : t("errors.unknown"));
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    if (!candidate) return;
    try {
      await apiPost("/api/v1/reports", {
        target_user_id: candidate.userId,
        reason: "mobile_profile_report",
        details: "Reported from mobile profile detail",
      });
      Alert.alert(t("safety.reportSent") || "Reported", t("safety.reportThanks") || "Thanks");
    } catch (e) {
      Alert.alert(t("common.errorGeneric"), e instanceof Error ? e.message : t("errors.unknown"));
    }
  }

  if (loading) {
    return (
      <PremiumScreen>
        <SkeletonLoader />
      </PremiumScreen>
    );
  }
  if (error && !candidate) {
    return (
      <PremiumScreen>
        <ErrorState message={error} onRetry={load} retryLabel={t("mobile.retry")} />
      </PremiumScreen>
    );
  }
  if (!candidate) {
    return (
      <PremiumScreen>
        <EmptyState title={t("mobile.profileDetail")} body={t("discovery.emptyBody")} />
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] }}>
        <PremiumHeader
          title={candidate.displayName}
          subtitle={candidate.fuzzyRegion}
          right={<MatchScore score={candidate.score} />}
        />
        <Text style={styles.disclaimer}>{t("mobile.compatDisclaimer")}</Text>
        <StatusBadge label={t("mobile.compatLabel", { score: Math.round(candidate.score <= 1 ? candidate.score * 100 : candidate.score) })} tone="gold" />
        <View style={{ height: spacing[3] }} />
        {(candidate.interests ?? []).map((tag) => (
          <StatusBadge key={tag} label={tag} />
        ))}
        {(candidate.reasons ?? []).map((r) => (
          <Text key={r} style={styles.reason}>
            • {r}
          </Text>
        ))}
        <View style={{ height: spacing[4] }} />
        <PremiumButton label={t("mobile.sendLike")} onPress={like} disabled={busy} />
        <View style={{ height: spacing[2] }} />
        <PremiumButton label={t("safety.report") || "Report"} variant="outline" onPress={report} />
      </ScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: spacing[3] },
  reason: { color: colors.ink, marginTop: spacing[2], lineHeight: 20 },
});
