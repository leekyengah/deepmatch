import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { apiGet, apiPost, type MatchRow } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import { Empty, Loading, Muted, Screen, Title } from "../../components/ui";
import { colors } from "../../constants/theme";

export default function LikesScreen() {
  const t = useT();
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  function unmatch(item: MatchRow) {
    Alert.alert(
      t("matching.unmatch"),
      t("matching.unmatchConfirm", { name: item.peer_name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("matching.unmatch"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              setBusyId(item.match_id);
              try {
                await apiPost("/api/v1/matches/unmatch", {
                  match_id: item.match_id,
                  peer_id: item.peer_id,
                });
                setRows((prev) =>
                  prev.filter((r) => r.match_id !== item.match_id),
                );
              } catch (e) {
                Alert.alert(
                  t("matching.unmatchError"),
                  e instanceof Error ? e.message : t("errors.unknown"),
                );
              } finally {
                setBusyId(null);
              }
            })();
          },
        },
      ],
    );
  }

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
      <Muted>{t("matching.pageIntro")}</Muted>
      <FlatList
        style={{ marginTop: 16 }}
        data={rows}
        keyExtractor={(item) => item.match_id}
        ListEmptyComponent={<Empty text={t("matching.emptyTitle")} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              style={styles.main}
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
            <Pressable
              onPress={() => unmatch(item)}
              disabled={busyId === item.match_id}
              accessibilityRole="button"
              accessibilityLabel={t("matching.unmatch")}
              style={styles.unmatchBtn}
            >
              <Text style={styles.unmatchText}>{t("matching.unmatch")}</Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
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
  unmatchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unmatchText: { fontSize: 12, fontWeight: "700", color: colors.primary },
});
