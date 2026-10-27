import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { Button, Muted, Screen, Title } from "../../components/ui";
import { apiGet } from "../../lib/api";
import { uploadMobileMedia } from "../../lib/media";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors, spacing } from "../../constants/theme";

type LibraryPayload = {
  counts?: { images: number; videos: number; approved_or_pending: number };
  gate?: { discover_eligible?: boolean; reasons?: string[] };
};

/** Member media gate — 3–10 profile photos for Discover (not Admin). */
export default function MeMediaScreen() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    images: 0,
    videos: 0,
    approved_or_pending: 0,
  });
  const [eligible, setEligible] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data?: LibraryPayload }>(
        "/api/v1/media/library",
      );
      const data = res.data;
      setCounts(
        data?.counts ?? { images: 0, videos: 0, approved_or_pending: 0 },
      );
      setEligible(Boolean(data?.gate?.discover_eligible));
      setReasons(data?.gate?.reasons ?? []);
    } catch (e) {
      Alert.alert(
        t("common.errorGeneric"),
        e instanceof Error ? e.message : t("errors.unknown"),
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

  async function onAddPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("profile.avatarIntentFailed"));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setBusy(true);
    try {
      await uploadMobileMedia({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        bytes: asset.fileSize,
        purpose: "profile",
      });
      await load();
      Alert.alert(t("profile.avatarDone"));
    } catch (e) {
      Alert.alert(
        t("profile.avatarIntentFailed"),
        e instanceof Error ? e.message : t("errors.unknown"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>{t("common.back")}</Text>
        </Pressable>
        <Title>{t("profile.mediaGateTitle")}</Title>
        <Muted>{t("profile.mediaGateIntro")}</Muted>
        <Muted>{t("profile.mediaGateRule")}</Muted>

        {loading ? (
          <Muted>{t("common.loading")}</Muted>
        ) : (
          <View style={styles.card}>
            <Text style={styles.stat}>
              {t("profile.mediaGateImages")}: {counts.images} (
              {counts.approved_or_pending} OK)
            </Text>
            <Text style={styles.stat}>
              {t("profile.mediaGateVideos")}: {counts.videos}
            </Text>
            <Text
              style={[
                styles.gate,
                eligible ? styles.gateOk : styles.gateBlocked,
              ]}
            >
              {eligible
                ? t("profile.mediaGateEligible")
                : t("profile.mediaGateBlocked")}
            </Text>
            {reasons.includes("need_min_3_images") ? (
              <Muted>{t("profile.mediaGateNeedMin")}</Muted>
            ) : null}
          </View>
        )}

        <Button
          label={
            busy ? t("profile.uploading") : t("profile.mediaGateUploadCta")
          }
          onPress={() => void onAddPhoto()}
          disabled={busy || counts.images >= 10}
        />
        <Text style={{ height: 12 }} />
        <Button
          label={t("nav.explore")}
          variant="outline"
          onPress={() => router.replace("/(tabs)/discover")}
          disabled={!eligible}
        />
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
  card: {
    marginVertical: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.panel,
    borderRadius: 12,
    gap: 6,
  },
  stat: { color: colors.ink, fontSize: 15 },
  gate: { marginTop: 8, fontWeight: "700", fontSize: 15 },
  gateOk: { color: colors.primary },
  gateBlocked: { color: colors.raspberry },
});
