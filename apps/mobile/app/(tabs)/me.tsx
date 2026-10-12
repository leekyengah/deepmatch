import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Button, Muted, Screen, Title } from "../../components/ui";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../lib/auth";
import { apiPost } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import { purchasePremium, restorePremium } from "../../lib/iap";
import { colors, LEGAL_URLS } from "../../constants/theme";

export default function MeScreen() {
  const { user, signOut } = useAuth();
  const t = useT();
  const [busy, setBusy] = useState(false);

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

        <Text style={styles.h2}>{t("profile.legalSection")}</Text>
        <Button
          label={t("marketing.privacy")}
          variant="outline"
          onPress={() => WebBrowser.openBrowserAsync(LEGAL_URLS.privacy)}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("marketing.terms")}
          variant="outline"
          onPress={() => WebBrowser.openBrowserAsync(LEGAL_URLS.terms)}
        />
        <Text style={{ height: 10 }} />
        <Button
          label={t("profile.deleteAccountWeb")}
          variant="outline"
          onPress={() =>
            WebBrowser.openBrowserAsync(LEGAL_URLS.accountDeletion)
          }
        />

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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h2: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
    color: colors.raspberry,
  },
});
