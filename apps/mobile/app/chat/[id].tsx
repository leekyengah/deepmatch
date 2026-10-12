import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet, apiPost, type MessageRow } from "../../lib/api";
import { Button, Field, Loading, Screen } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors } from "../../constants/theme";

export default function ChatThreadScreen() {
  const { id, name, peerId } = useLocalSearchParams<{
    id: string;
    name?: string;
    peerId?: string;
  }>();
  const { user } = useAuth();
  const t = useT();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiGet<{ messages: MessageRow[] }>(
        `/api/v1/messages?conversationId=${encodeURIComponent(id)}`,
      );
      setMessages(res.messages ?? []);
      await apiPost("/api/v1/chat/read", { conversation_id: id });
    } catch (e) {
      Alert.alert(
        t("chat.title"),
        e instanceof Error ? e.message : t("chat.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    const body = text.trim();
    if (!body || !id) return;
    setText("");
    try {
      await apiPost("/api/v1/messages", {
        conversationId: id,
        text: body,
        clientDedupeKey: `${Date.now()}`,
      });
      await load();
    } catch (e) {
      Alert.alert(
        t("chat.sendFailed"),
        e instanceof Error ? e.message : t("errors.unknown"),
      );
    }
  }

  async function report() {
    if (!peerId) return;
    try {
      await apiPost("/api/v1/reports", {
        target_user_id: peerId,
        conversation_id: id,
        reason: "mobile_report",
      });
      Alert.alert(t("chat.reportSent"));
    } catch (e) {
      Alert.alert(
        t("common.errorGeneric"),
        e instanceof Error ? e.message : t("errors.unknown"),
      );
    }
  }

  async function block() {
    if (!peerId) return;
    try {
      await apiPost("/api/v1/blocks", { blocked_user_id: peerId });
      Alert.alert(t("chat.blocked"));
    } catch (e) {
      Alert.alert(
        t("common.errorGeneric"),
        e instanceof Error ? e.message : t("errors.unknown"),
      );
    }
  }

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <View style={styles.toolbar}>
        <Text style={styles.peer}>{name ?? t("chat.title")}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button label={t("chat.report")} variant="outline" onPress={report} />
          <Button label={t("chat.block")} variant="danger" onPress={block} />
        </View>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => {
          const mine = item.sender_id === user?.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={{ color: mine ? "#fff" : colors.ink }}>
                {item.body}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <Field
          placeholder={t("chat.composerPlaceholder")}
          value={text}
          onChangeText={setText}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <Button label={t("chat.send")} onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 8,
  },
  peer: { fontWeight: "700", color: colors.raspberry, fontSize: 16 },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.panel,
  },
});
