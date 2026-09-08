import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";
import DiscordProvider from "next-auth/providers/discord";

// Build list of active providers dynamically to prevent NextAuth from crashing
// if credentials are not yet configured in the environment.
const providers: any[] = [];

const isTwitchConfigured = Boolean(
  process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET
);

const isGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const isDiscordConfigured = Boolean(
  process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
);

// Safe logging in development without printing any secret values
if (process.env.NODE_ENV === "development") {
  console.log(
    `[Auth Configuration Status] Twitch: ${
      isTwitchConfigured ? "Configurado (Activo)" : "Desactivado (Faltan variables)"
    } | Google: ${
      isGoogleConfigured ? "Configurado (Activo)" : "Desactivado (Faltan variables)"
    }`
  );
}

if (isTwitchConfigured) {
  providers.push(
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID as string,
      clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
      checks: ["none"],
      authorization: {
        params: {
          scope: "openid user:read:email",
        },
      },
    })
  );
}

if (isGoogleConfigured) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      checks: ["none"],
      authorization: {
        params: {
          // Minimal sign-in permissions requested initially as required
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
}

if (isDiscordConfigured) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Support both AUTH_SECRET and NEXTAUTH_SECRET with fallback for dev
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "streamsync-dev-auth-secret-key-do-not-use-in-production",
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).provider = token.provider as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
};

export function getProvidersStatus() {
  return {
    twitch: isTwitchConfigured,
    google: isGoogleConfigured,
    discord: isDiscordConfigured,
  };
}
