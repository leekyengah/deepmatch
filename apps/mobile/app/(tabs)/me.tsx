import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Button, Muted, Screen, Title } from "../../components/ui";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../lib/auth";
import { apiPost } from "../../lib/api";
import { uploadMobileMedia } from "../../lib/media";
import { supabase } from "../../lib/supabase";
import { fetchIsStaff } from "../../lib/staff";
import { useT } from "../../lib/i18n/I18nProvider";
import { purchasePremium, restorePremium } from "../../lib/iap";
import { colors, LEGAL_URLS } from "../../constants/theme";

async function openLegal(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

export default function MeScreen() {
  const { user, signOut } = useAuth();
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [staff, setStaff] = useState(false);

  useEffect(() => {
    void fetchIsStaff().then(setStaff);
  }, []);

  async function onAvatar() {
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
    setAvatarBusy(true);
    try {
      const { mediaId } = await uploadMobileMedia({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        bytes: asset.fileSize,
        purpose: "avatar",
      });
      const { data: media } = await supabase
        .from("media_objects")
        .select("storage_path")
        .eq("id", mediaId)
        .maybeSingle();
      if (media?.storage_path && user?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_path: media.storage_path,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (error) {
          Alert.alert(
            t("profile.avatarProfilePartial", { error: error.message }),
          );
          return;
        }
      }
      Alert.alert(t("profile.avatarDone"));
    } catch (e) {
      Alert.alert(
        t("profile.avatarIntentFailed"),
        e instanceof Error ? e.message : t("errors.unknown"),
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onBuy() {
    setBusy(true);
    const res = await purchasePremium();
    setBusy(false);
    Alert.alert(
      res.ok ? t("commerce.premium") : t("common.errorGeneric"),
      res.ok
        ? t("commerce.statusLabel", { status: res.status })
        : res.error,
    );
  }

  async function onRestore() {
    setBusy(true);
    const res = await restorePremium();
    setBusy(false);
    Alert.alert(
      res.ok ? t("commerce.restore") : t("common.errorGeneric"),
      res.ok
        ? t("commerce.statusLabel", { status: res.status })
        : res.error,
    );
  }

  function onDelete() {
    Alert.alert(t("profile.deleteAccount"), t("profile.deleteWarning"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await apiPost("/api/v1/me/delete", { confirm: "DELETE" });
            await signOut();
          } catch (e) {
            Alert.alert(
              t("common.errorGeneric"),
              e instanceof Error ? e.message : t("errors.unknown"),
            );
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>{t("profile.title")}</Title>
        <Muted>{user?.email ?? ""}</Muted>

        <Text style={styles.h2}>{t("mobile.hubGoals")}</Text>
        <Button
          label={t("mobile.goalsTitle")}
          variant="outline"
          onPress={() => router.push("/onboarding/goals")}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("mobile.hubNotifications")}
          variant="outline"
          onPress={() => router.push("/notifications")}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("mobile.hubPremium")}
          variant="outline"
          onPress={() => router.push("/premium/" as never)}
        />
        {staff ? (
          <>
            <Text style={{ height: 10 }} />
            <Button
              label={t("mobile.hubAdmin")}
              onPress={() => router.push("/(admin)/" as never)}
            />
          </>
        ) : null}

        <Text style={styles.h2}>{t("profile.avatarTitle")}</Text>
        <Muted>{t("profile.avatarHint")}</Muted>
        <Button
          label={
            avatarBusy ? t("profile.uploading") : t("profile.choosePhoto")
          }
          onPress={() => void onAvatar()}
          disabled={avatarBusy}
        />

        <Text style={styles.h2}>{t("profile.languageSection")}</Text>
        <LanguageSwitcher />
        <Muted>{t("common.languageHint")}</Muted>

        <Text style={styles.h2}>{t("commerce.premiumIapTitle")}</Text>
        <Muted>{t("commerce.premiumIapHint")}</Muted>
        <Button
          label={busy ? "…" : t("commerce.buyPremium")}
          onPress={onBuy}
          disabled={busy}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("commerce.restorePurchases")}
          onPress={onRestore}
          variant="outline"
          disabled={busy}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("commerce.subscriptionsPolicyLink")}
          variant="outline"
          onPress={() => openLegal(LEGAL_URLS.subscriptions)}
        />

        <Text style={styles.h2}>{t("profile.legalPrivacyHub")}</Text>
        <Muted>{t("profile.legalHubHint")}</Muted>
        {(
          [
            [t("profile.legalCenter"), LEGAL_URLS.hub],
            [t("marketing.terms"), LEGAL_URLS.terms],
            [t("marketing.privacy"), LEGAL_URLS.privacy],
            [t("profile.privacy"), LEGAL_URLS.privacySettings],
            [t("profile.supportLink"), LEGAL_URLS.support],
            [t("commerce.subscriptionsPolicyLink"), LEGAL_URLS.subscriptions],
            [t("profile.deleteAccountWeb"), LEGAL_URLS.accountDeletion],
          ] as const
        ).map(([label, url]) => (
          <ViewButton key={url} label={label} onPress={() => openLegal(url)} />
        ))}

        <Text style={styles.h2}>{t("profile.account")}</Text>
        <Button
          label={t("auth.logout")}
          variant="outline"
          onPress={() => signOut()}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("profile.deleteAccount")}
          variant="danger"
          onPress={onDelete}
        />
        <Muted>{t("profile.deleteSubscriptionNote")}</Muted>
      </ScrollView>
    </Screen>
  );
}

function ViewButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <>
      <Text style={{ height: 10 }} />
      <Button label={label} variant="outline" onPress={onPress} />
    </>
  );
}

const styles = StyleSheet.create({
  h2: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: colors.raspberry,
  },
});
