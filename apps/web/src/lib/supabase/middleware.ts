import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath } from "@/lib/auth/public-paths";
import {
  isEmailVerified,
  isUnverifiedAllowedPath,
} from "@/lib/auth/email-verified";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof supabaseResponse.cookies.set>[2];
        }[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && !isPublicPath(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    const next = `${pathname}${search || ""}`;
    if (next && next !== "/") {
      login.searchParams.set("next", next);
    }
    const redirect = NextResponse.redirect(login);
    // Prevent intermediary caches from storing gated HTML/redirects
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }

  // Soft gate: unverified email cannot use dating surfaces until confirmed.
  if (
    user &&
    !isEmailVerified(user) &&
    !isUnverifiedAllowedPath(pathname) &&
    !isPublicPath(pathname)
  ) {
    const verify = request.nextUrl.clone();
    verify.pathname = "/auth/verify-email";
    verify.search = "";
    const redirect = NextResponse.redirect(verify);
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }

  if (user && !isPublicPath(pathname)) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store");
  }

  return supabaseResponse;
}
