import { Platform } from "react-native";
import Constants from "expo-constants";
import { apiPost } from "./api";
import { IAP_PRODUCT_ID } from "../constants/theme";

type PurchaseResult =
  | { ok: true; status: string }
  | { ok: false; error: string };

function isExpoGo() {
  return Constants.appOwnership === "expo";
}

/**
 * StoreKit IAP — Expo Go unsupported; EAS build will re-add react-native-iap.
 */
export async function purchasePremium(): Promise<PurchaseResult> {
  if (Platform.OS !== "ios") {
    return { ok: false, error: "IAP chỉ hỗ trợ iOS trong MVP." };
  }
  if (isExpoGo()) {
    return {
      ok: false,
      error: "Expo Go không hỗ trợ IAP — dùng bản EAS/TestFlight.",
    };
  }
  return {
    ok: false,
    error: `Cần bản native build + product ${IAP_PRODUCT_ID}.`,
  };
}

export async function restorePremium(): Promise<PurchaseResult> {
  if (isExpoGo() || Platform.OS !== "ios") {
    return {
      ok: false,
      error: "Restore chỉ trên iOS native build (không phải Expo Go).",
    };
  }
  try {
    const res = await apiPost<{ data: { status: string } }>(
      "/api/v1/payments/apple/verify",
      { signedTransaction: "" },
    );
    return { ok: true, status: res.data.status };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Restore thất bại.",
    };
  }
}
