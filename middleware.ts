import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeNext } from "./lib/safe-next";

/**
 * Keeps the Supabase session fresh on every request.
 *
 * Without this file, Server Components can read the auth cookie but never
 * write a refreshed one (Next forbids setting cookies during render). Once
 * the 1-hour access token expired, server pages randomly saw a signed-out
 * user while the browser still thought it was signed in — the "sometimes
 * logged out / random error / lag" behaviour. Refreshing here, where
 * cookies CAN be written, fixes it for every page.
 *
 * Also does the signed-in check for private pages up front, so they
 * redirect before rendering instead of flashing a "please sign in" state.
 */
const PRIVATE_PREFIXES = ["/sessions", "/profile", "/provider", "/welcome"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Must be getUser(), not getSession(): it validates and refreshes.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && isPrivate) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    const target = new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url);
    url.pathname = target.pathname;
    url.search = target.search;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // Keep private pages out of search results even if someone links to them.
  if (isPrivate || path === "/login") response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}

export const config = {
  // Skip static files, images and the webhook (Razorpay has no cookies).
  matcher: [
    "/((?!_next/static|_next/image|favicon|api/webhooks|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|txt|xml)$).*)",
  ],
};
