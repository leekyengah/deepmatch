import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { apiPut } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  PremiumButton,
  PremiumHeader,
  PremiumScreen,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

type Intent = "friends" | "dating" | "marriage";

/** M02 — Relationship goals (writes needs preferences) */
export default function GoalsScreen() {
  const t = useT();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [busy, setBusy] = useState(false);

  const options: Array<{ id: Intent; label: string }> = [
    { id: "friends", label: t("mobile.goalsFriends") },
    { id: "dating", label: t("mobile.goalsDating") },
    { id: "marriage", label: t("mobile.goalsMarriage") },
  ];

  async function save() {
    if (!intent) return;
    setBusy(true);
    const answerMap: Record<Intent, string> = {
      friends: "kết bạn",
      dating: "hẹn hò",
      marriage: "hướng đến hôn nhân",
    };
    try {
      await apiPut("/api/v1/needs/answers", {
        consent: true,
        merge: true,
        answers: { C01: answerMap[intent] },
      });
      Alert.alert(t("mobile.goalsSaved"));
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert(
        t("common.errorGeneric"),
        e instanceof Error ? e.message : t("errors.unknown"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PremiumScreen>
      <PremiumHeader title={t("mobile.goalsTitle")} />
      {options.map((opt) => {
        const selected = intent === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => setIntent(opt.id)}
            style={[styles.card, selected && styles.cardSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.cardText, selected && { color: colors.primary }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ height: spacing[4] }} />
      <PremiumButton
        label={t("mobile.goalsContinue")}
        onPress={save}
        disabled={!intent || busy}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    borderRadius: layout.radiusLg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.softBlush,
  },
  cardText: { fontSize: 17, fontWeight: "700", color: colors.ink },
});
