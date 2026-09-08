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
      allowDangerousEmailAccountLinking: true,
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
      allowDangerousEmailAccountLinking: true,
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
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
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
    async signIn({ user, account }) {
      if (!account) return true;

      // Handle safe account linking if user is already logged in
      try {
        const { cookies } = await import("next/headers");
        const { decode } = await import("next-auth/jwt");
        const cookieStore = cookies();
        const secret =
          process.env.AUTH_SECRET ||
          process.env.NEXTAUTH_SECRET ||
          "streamsync-dev-auth-secret-key-do-not-use-in-production";

        const sessionToken =
          cookieStore.get("__Secure-next-auth.session-token")?.value ||
          cookieStore.get("next-auth.session-token")?.value;

        if (sessionToken && process.env.DATABASE_URL) {
          const decoded = await decode({ token: sessionToken, secret });
          const currentUserId = decoded?.id as string | undefined;

          if (currentUserId) {
            // Check if this external account already belongs to another user
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
            });

            if (existingAccount && existingAccount.userId !== currentUserId) {
              // Account already linked to a different user - forbid merge!
              return "/profile?error=AccountAlreadyLinked";
            }

            if (!existingAccount) {
              // Link account to current user
              await prisma.account.create({
                data: {
                  userId: currentUserId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
              return "/profile?linked=" + encodeURIComponent(account.provider);
            } else {
              // Update tokens and scope if linking again (e.g. elevated permissions)
              await prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                  access_token: account.access_token,
                  refresh_token: account.refresh_token ?? existingAccount.refresh_token,
                  scope: account.scope ?? existingAccount.scope,
                  expires_at: account.expires_at ?? existingAccount.expires_at,
                },
              });
              return "/profile?linked=" + encodeURIComponent(account.provider);
            }
          }
        }
      } catch (err) {
        console.error("Account linking evaluation error:", err);
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user, account, profile }) {
      if (user?.id && account && process.env.DATABASE_URL) {
        const updates: any = {};
        if (account.provider === "twitch") {
          const twitchName =
            (profile as any)?.preferred_username ||
            (profile as any)?.login ||
            user.name;
          if (twitchName) updates.twitchUsername = twitchName;
        } else if (account.provider === "google") {
          const ytName = (profile as any)?.name || user.name;
          if (ytName) updates.youtubeHandle = ytName;
        }
        if (Object.keys(updates).length > 0) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: updates,
            });
          } catch (e) {
            console.error("Error setting provider username in linkAccount:", e);
          }
        }
      }
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
