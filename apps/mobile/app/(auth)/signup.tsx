import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Switch, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Button, Field, Muted, Screen, Title } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors, LEGAL_URLS } from "../../constants/theme";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("1998-01-01");
  const [ageOk, setAgeOk] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ackPrivacy, setAckPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (!ageOk || !acceptTerms || !ackPrivacy) {
      Alert.alert(t("common.errorGeneric"), t("auth.needAgeTos"));
      return;
    }
    setBusy(true);
    const result = await signUp(email, password, birthDate);
    setBusy(false);
    if (result.error) {
      Alert.alert(t("auth.signupFailed"), result.error);
      return;
    }
    if (result.needsVerification) {
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email },
      } as never);
      return;
    }
    Alert.alert(t("common.confirm"), t("auth.signupSuccess"));
    router.replace("/(tabs)" as never);
  }

  return (
    <Screen style={styles.wrap}>
      <Title>{t("auth.signup")}</Title>
      <Muted>{t("auth.ageGate")}</Muted>
      <Field
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("auth.email")}
        value={email}
        onChangeText={setEmail}
      />
      <Field
        secureTextEntry
        placeholder={t("auth.passwordMin")}
        value={password}
        onChangeText={setPassword}
      />
      <Field
        placeholder={t("auth.birthDatePlaceholder")}
        value={birthDate}
        onChangeText={setBirthDate}
      />

      <ConsentRow
        value={ageOk}
        onValueChange={setAgeOk}
        label={t("auth.ageConfirm")}
      />
      <ConsentRow
        value={acceptTerms}
        onValueChange={setAcceptTerms}
        label={`${t("auth.acceptTermsPrefix")} ${t("auth.termsLink")}`}
        onOpenPolicy={() => WebBrowser.openBrowserAsync(LEGAL_URLS.terms)}
      />
      <ConsentRow
        value={ackPrivacy}
        onValueChange={setAckPrivacy}
        label={`${t("auth.ackPrivacyPrefix")} ${t("auth.privacyLink")}${t("auth.ackPrivacySuffix")}`}
        onOpenPolicy={() => WebBrowser.openBrowserAsync(LEGAL_URLS.privacy)}
      />
      <Muted>{t("auth.consentNotBundledHint")}</Muted>

      <Button
        label={busy ? t("auth.creatingAccount") : t("auth.signup")}
        onPress={onSubmit}
        disabled={busy || !ageOk || !acceptTerms || !ackPrivacy}
      />
      <Link href="/(auth)/login" style={{ marginTop: 12 }}>
        <Text style={styles.link}>{t("auth.hasAccountLogin")}</Text>
      </Link>
    </Screen>
  );
}

function ConsentRow({
  value,
  onValueChange,
  label,
  onOpenPolicy,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label: string;
  onOpenPolicy?: () => void;
}) {
  return (
    <View style={styles.consentRow}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.blush }}
        thumbColor={value ? colors.primary : "#f4f3f4"}
      />
      <Text style={styles.consentLabel} onPress={onOpenPolicy}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", gap: 4 },
  link: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  consentLabel: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
});
