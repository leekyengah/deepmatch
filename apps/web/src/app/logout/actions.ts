"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthCookieName } from "@/lib/auth/clear-auth-cookies";
import { createClient } from "@/lib/supabase/server";

/** Clear Supabase auth cookies even if SSR client setAll is a no-op. */
async function clearAuthCookies() {
  const cookieStore = await cookies();
  for (const { name } of cookieStore.getAll()) {
    if (isAuthCookieName(name)) {
      // Match typical Supabase SSR cookie path/host scope so browsers drop the jar.
      cookieStore.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  await clearAuthCookies();
  redirect("/");
}
