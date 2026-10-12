import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet, apiPost, type Candidate } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import { Button, Empty, Loading, Muted, Screen, Title } from "../../components/ui";
import { colors } from "../../constants/theme";

export default function DiscoverScreen() {
  const t = useT();
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const current = items[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { candidates: Candidate[] } }>(
        "/api/v1/discovery/candidates?page_size=20",
      );
      setItems(res.data.candidates ?? []);
    } catch (e) {
      Alert.alert(
        t("discovery.title"),
        e instanceof Error ? e.message : t("discovery.loadError"),
      );
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
      <Screen>
        <Loading />
      </Screen>
    );
  }

  if (!current) {
    return (
      <Screen>
        <Title>{t("discovery.title")}</Title>
        <Empty text={t("discovery.emptyBody")} />
        <Button label={t("common.reload")} onPress={load} variant="outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>{t("discovery.title")}</Title>
      <View style={styles.card}>
        <Text style={styles.name}>{current.displayName}</Text>
        <Muted>{current.fuzzyRegion || t("discovery.fuzzyRegion")}</Muted>
        <Text style={styles.score}>
          {t("discovery.badge")} {Math.round(current.score)}
        </Text>
        <Text style={styles.tags}>
          {(current.interests ?? []).slice(0, 6).join(" · ") ||
            t("discovery.defaultReason")}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Button
            label={t("discovery.pass")}
            onPress={() => act("pass")}
            variant="outline"
            disabled={busy}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Button
            label={t("discovery.like")}
            onPress={() => act("like")}
            disabled={busy}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    marginVertical: 16,
    justifyContent: "flex-end",
  },
  name: { fontSize: 32, fontWeight: "700", color: colors.raspberry },
  score: { marginTop: 8, color: colors.primary, fontWeight: "700" },
  tags: { marginTop: 12, color: colors.ink, lineHeight: 22 },
  row: { flexDirection: "row", marginBottom: 24 },
});
