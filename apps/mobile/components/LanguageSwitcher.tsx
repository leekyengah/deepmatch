import { Pressable, Text, View } from "react-native";
import { LOCALES, LOCALE_LABELS, type Locale } from "@deepmatch/i18n";
import { useI18n } from "../lib/i18n/I18nProvider";
import { colors } from "../constants/theme";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <View accessibilityLabel={t("accessibility.languageSwitcher")}>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
        {t("common.language")}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <Pressable
              key={code}
              onPress={() => void setLocale(code as Locale)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.line,
                backgroundColor: active ? "#FFE9F0" : colors.panel,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: active ? colors.primary : colors.raspberry,
                  fontSize: 12,
                }}
              >
                {LOCALE_LABELS[code]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
