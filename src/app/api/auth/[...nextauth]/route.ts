import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const handler = NextAuth(authOptions);

export async function GET(
  req: NextRequest,
  context: { params: { nextauth?: string[] } }
) {
  const params = await context.params;
  const nextauth = params?.nextauth || [];
  const action = nextauth[0];
  const provider = nextauth[1];

  // Direct browser navigation support for Twitch and Google OAuth signin
  if (action === "signin" && (provider === "twitch" || provider === "google")) {
    const url = new URL(req.url);
    const callbackUrlParam = url.searchParams.get("callbackUrl") || "/dashboard";

    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "streamsync-livid.vercel.app";
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXTAUTH_URL || `${proto}://${host}`;

    let authorizationUrl = "";

    if (provider === "twitch") {
      const clientId = process.env.TWITCH_CLIENT_ID;
      if (!clientId) {
        return NextResponse.redirect(new URL("/auth?error=TwitchNotConfigured", baseUrl));
      }
      const redirectUri = `${baseUrl}/api/auth/callback/twitch`;
      const twitchParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid user:read:email",
        state: crypto.randomBytes(16).toString("hex"),
        claims: JSON.stringify({
          id_token: {
            email: null,
            picture: null,
            preferred_username: null,
          },
        }),
      });
      authorizationUrl = `https://id.twitch.tv/oauth2/authorize?${twitchParams.toString()}`;
    } else if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return NextResponse.redirect(new URL("/auth?error=GoogleNotConfigured", baseUrl));
      }
      const redirectUri = `${baseUrl}/api/auth/callback/google`;
      const googleParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        prompt: "consent",
        access_type: "offline",
        state: crypto.randomBytes(16).toString("hex"),
      });
      authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`;
    }

    if (authorizationUrl) {
      const response = NextResponse.redirect(authorizationUrl, 302);
      const isSecure = proto === "https";
      const secureCookieName = "__Secure-next-auth.callback-url";
      const standardCookieName = "next-auth.callback-url";

      if (isSecure) {
        response.cookies.set(secureCookieName, callbackUrlParam, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: true,
        });
      }
      response.cookies.set(standardCookieName, callbackUrlParam, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
      });

      return response;
    }
  }

  return handler(req, context);
}

export { handler as POST };

