import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Validate next param — only allow relative paths starting with /
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // This can fail in edge cases; middleware handles it
              }
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const baseUrl = isLocalEnv
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin;

      // Detect new signup: created_at and last_sign_in_at within 10 seconds
      const user = data.session.user;
      const createdAt = new Date(user.created_at).getTime();
      const lastSignIn = new Date(
        user.last_sign_in_at ?? user.created_at,
      ).getTime();
      const isNewUser = Math.abs(createdAt - lastSignIn) < 10_000;

      // New users go straight to integrations to connect their first app
      const isCheckoutNext = next.startsWith("/checkout");
      const destination = isNewUser && !isCheckoutNext ? "/dashboard/integrations" : next;
      return NextResponse.redirect(`${baseUrl}${destination}`);
    }

    // Exchange failed — use generic error code (don't leak internal details)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // No code parameter — redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code_in_callback`);
}
