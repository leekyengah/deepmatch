import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiGet, type MatchRow } from "../lib/api";
import { useT } from "../lib/i18n/I18nProvider";
import {
  EmptyState,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../components/premium";
import { colors, layout, spacing } from "../constants/theme";

type Notif = {
  id: string;
  title: string;
  body: string;
  href?: string;
  kind: "connections" | "system" | "services";
};

/** M12 — Notifications inbox (derived from matches + system stubs; push later) */
export default function NotificationsScreen() {
  const t = useT();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Notif["kind"]>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { matches: MatchRow[] } }>("/api/v1/matches");
      const derived: Notif[] = (res.data.matches ?? []).slice(0, 20).map((m) => ({
        id: m.match_id,
        title: m.peer_name,
        body:
          m.unread_count > 0
            ? `${m.unread_count} tin chưa đọc`
            : t("chat.title") || "Chat",
        href: m.conversation_id ? `/chat/${m.conversation_id}` : "/(tabs)/chat",
        kind: "connections" as const,
      }));
      derived.push({
        id: "sys-privacy",
        title: t("nav.safe") || "DeepSafe",
        body: t("mobile.compatDisclaimer"),
        href: "/(tabs)/me",
        kind: "system",
      });
      setItems(derived);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const visible = filter === "all" ? items : items.filter((i) => i.kind === filter);

  if (loading) {
    return (
      <PremiumScreen>
        <SkeletonLoader />
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <PremiumHeader title={t("mobile.notificationsTitle")} />
      <View style={styles.filters}>
        {(["all", "connections", "system", "services"] as const).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)}>
            <StatusBadge label={f} tone={filter === f ? "gold" : "neutral"} />
          </Pressable>
        ))}
      </View>
      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState title={t("mobile.notificationsEmpty")} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => item.href && router.push(item.href as never)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </Pressable>
        )}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing[3] },
  row: {
    backgroundColor: colors.panel,
    borderRadius: layout.radiusMd,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  title: { color: colors.ink, fontWeight: "700" },
  body: { color: colors.muted, marginTop: 4, lineHeight: 18 },
});
