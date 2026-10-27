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
import { ErrorState } from "../../components/premium";
import { colors } from "../../constants/theme";

export default function LikesScreen() {
  const t = useT();
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data: { matches: MatchRow[] } }>(
        "/api/v1/matches",
      );
      setRows(res.data.matches ?? []);
    } catch (e) {
      setError(
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

  function confirmUnmatch(m: MatchRow) {
    Alert.alert(
      t("matching.unmatch"),
      t("matching.unmatchConfirm", { name: m.peer_name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("matching.unmatch"),
          style: "destructive",
          onPress: () => void unmatch(m),
        },
      ],
    );
  }

  async function unmatch(m: MatchRow) {
    setBusyId(m.match_id);
    try {
      await apiPost("/api/v1/matches/unmatch", {
        match_id: m.match_id,
        peer_id: m.peer_id,
      });
      setRows((prev) => prev.filter((x) => x.match_id !== m.match_id));
    } catch (e) {
      Alert.alert(
        t("matching.unmatch"),
        e instanceof Error ? e.message : t("matching.unmatchError"),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState
          message={error}
          onRetry={() => void load()}
          retryLabel={t("common.retry")}
        />
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
              style={styles.unmatch}
              disabled={busyId === item.match_id}
              onPress={() => confirmUnmatch(item)}
              accessibilityRole="button"
              accessibilityLabel={t("matching.unmatch")}
            >
              <Text style={styles.unmatchText}>
                {busyId === item.match_id
                  ? t("common.loading")
                  : t("matching.unmatch")}
              </Text>
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
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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
  unmatch: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unmatchText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.raspberry ?? colors.primary,
  },
});
