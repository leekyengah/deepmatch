import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NativeModules, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  createTranslator,
  messages,
  resolveLocale,
  setActiveLocale,
  type Locale,
  type Translator,
} from "@deepmatch/i18n";

type Ctx = Translator & {
  setLocale: (locale: Locale) => Promise<void>;
  ready: boolean;
};

const I18nContext = createContext<Ctx | null>(null);

function deviceLocaleHint(): string | undefined {
  try {
    const settings =
      Platform.OS === "ios"
        ? NativeModules.SettingsManager?.settings
        : NativeModules.I18nManager;
    const raw =
      settings?.AppleLocale ||
      settings?.AppleLanguages?.[0] ||
      NativeModules.I18nManager?.localeIdentifier;
    return typeof raw === "string" ? raw : undefined;
  } catch {
    return undefined;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const stored = await SecureStore.getItemAsync(LOCALE_STORAGE_KEY);
        if (stored) setLocaleState(resolveLocale(stored));
        else setLocaleState(resolveLocale(deviceLocaleHint()));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const value = useMemo(() => {
    const tr = createTranslator(messages, locale);
    return { ...tr, setLocale, ready };
  }, [locale, setLocale, ready]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
