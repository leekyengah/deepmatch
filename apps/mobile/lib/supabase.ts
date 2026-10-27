import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * SecureStore values are capped (~2048 bytes). Supabase session JSON often
 * exceeds that, so login appears to "forget" across app restarts. Chunk keys.
 */
const CHUNK = 1800;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : null;
    }
    const meta = await SecureStore.getItemAsync(`${key}_chunks`);
    if (meta) {
      const n = Number(meta);
      if (!Number.isFinite(n) || n <= 0) return null;
      let out = "";
      for (let i = 0; i < n; i++) {
        const part = await SecureStore.getItemAsync(`${key}_${i}`);
        if (part == null) return null;
        out += part;
      }
      return out;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      return;
    }
    // Clear legacy single-key value if present.
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
    const chunks = Math.ceil(value.length / CHUNK) || 1;
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks));
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(
        `${key}_${i}`,
        value.slice(i * CHUNK, (i + 1) * CHUNK),
      );
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      return;
    }
    const meta = await SecureStore.getItemAsync(`${key}_chunks`);
    if (meta) {
      const n = Number(meta);
      for (let i = 0; i < n; i++) {
        try {
          await SecureStore.deleteItemAsync(`${key}_${i}`);
        } catch {
          /* ignore */
        }
      }
      try {
        await SecureStore.deleteItemAsync(`${key}_chunks`);
      } catch {
        /* ignore */
      }
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  },
};

export const supabase = createClient(url, anon, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
