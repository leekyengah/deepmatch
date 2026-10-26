import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { apiGet, type MatchRow } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import { Empty, Loading, Muted, Screen, Title } from "../../components/ui";
import { colors } from "../../constants/theme";

export default function LikesScreen() {
  const t = useT();
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { matches: MatchRow[] } }>(
        "/api/v1/matches",
      );
      setRows(res.data.matches ?? []);
    } catch (e) {
      Alert.alert(
        t("matching.title"),
        e instanceof Error ? e.message : t("matching.loadError"),
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

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>{t("matching.title")}</Title>
      <Muted>{t("matching.emptyBody")}</Muted>
      <FlatList
        style={{ marginTop: 16 }}
        data={rows}
        keyExtractor={(item) => item.match_id}
        ListEmptyComponent={<Empty text={t("matching.emptyTitle")} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              if (!item.conversation_id) {
                Alert.alert(t("chat.title"), t("matching.noConversation"));
                return;
              }
              router.push({
                pathname: "/chat/[id]",
                params: {
                  id: item.conversation_id,
                  name: item.peer_name,
                  peerId: item.peer_id,
                },
              });
            }}
          >
            <Text style={styles.name}>{item.peer_name}</Text>
            {item.unread_count > 0 ? (
              <Text style={styles.badge}>{item.unread_count}</Text>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: { fontSize: 17, fontWeight: "600", color: colors.ink },
  badge: {
    backgroundColor: colors.primary,
    color: "#fff",
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: "700",
  },
});
