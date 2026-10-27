import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Field, Muted, Screen, Title } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors, spacing } from "../../constants/theme";

/** Member profile edit — display name + fuzzy region (not Admin). */
export default function MeEditScreen() {
  const t = useT();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, fuzzy_region")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      Alert.alert(t("common.errorGeneric"), error.message);
    } else {
      setDisplayName(data?.display_name ?? "");
      setRegion(data?.fuzzy_region ?? "");
    }
    setLoading(false);
  }, [user?.id, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onSave() {
    if (!user?.id) return;
    const name = displayName.trim();
    if (!name) {
      Alert.alert(t("common.errorGeneric"), t("profile.displayName"));
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        fuzzy_region: region.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      Alert.alert(t("profile.saveFailed"), error.message);
      return;
    }
    Alert.alert(t("profile.saveProfile"), t("profile.savedDeep"));
    router.back();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>{t("common.back")}</Text>
        </Pressable>
        <Title>{t("profile.title")}</Title>
        <Muted>{user?.email ?? ""}</Muted>

        {loading ? (
          <Muted>{t("common.loading")}</Muted>
        ) : (
          <>
            <Text style={styles.label}>{t("profile.displayName")}</Text>
            <Field
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              placeholder={t("profile.displayName")}
            />
            <Text style={styles.label}>{t("profile.fuzzyRegionShort")}</Text>
            <Field
              value={region}
              onChangeText={setRegion}
              placeholder={t("profile.fuzzyPlaceholder")}
            />
            <Muted>{t("profile.fuzzyRegion")}</Muted>
            <Text style={{ height: 16 }} />
            <Button
              label={busy ? "…" : t("profile.saveProfile")}
              onPress={() => void onSave()}
              disabled={busy}
            />
            <Text style={{ height: 12 }} />
            <Button
              label={t("profile.mediaGateUploadCta")}
              variant="outline"
              onPress={() => router.push("/me/media" as never)}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing[3],
  },
  label: {
    marginTop: spacing[3],
    marginBottom: 6,
    fontWeight: "600",
    color: colors.ink,
  },
});
