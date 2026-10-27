import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getActiveLocale, t } from "@deepmatch/i18n";
import { isAgeEligible } from "@deepmatch/shared/age";
import { supabase } from "./supabase";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    birthDate: string,
  ) => Promise<{ error: string | null; needsVerification: boolean }>;
  resendVerification: (email?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, birthDate: string) => {
      if (!isAgeEligible(birthDate, 18)) {
        return {
          error: t(getActiveLocale(), "auth.ageGate"),
          needsVerification: false,
        };
      }
      const site =
        process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
        "https://datingvn.com";
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { birth_date: birthDate },
          emailRedirectTo: `${site}/auth/callback?next=/onboarding`,
        },
      });
      if (error) {
        return { error: error.message, needsVerification: false };
      }
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ birth_date: birthDate, discovery_opt_in: true })
          .eq("id", data.user.id);
      }
      const needsVerification = !data.user?.email_confirmed_at;
      return { error: null, needsVerification };
    },
    [],
  );

  const resendVerification = useCallback(async (email?: string) => {
    const target = (email ?? session?.user?.email ?? "").trim();
    if (!target) return t(getActiveLocale(), "auth.verifyMissingEmail");
    const site =
      process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "https://datingvn.com";
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: target,
      options: {
        emailRedirectTo: `${site}/auth/callback?next=/onboarding`,
      },
    });
    return error?.message ?? null;
  }, [session?.user?.email]);

  const signOut = useCallback(async () => {
    // Local first so SecureStore clears even if network/global revoke fails.
    await supabase.auth.signOut({ scope: "local" });
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      /* offline / already cleared */
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      emailVerified: Boolean(session?.user?.email_confirmed_at),
      signIn,
      signUp,
      resendVerification,
      signOut,
    }),
    [session, loading, signIn, signUp, resendVerification, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
