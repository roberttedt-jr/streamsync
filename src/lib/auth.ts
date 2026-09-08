import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import TwitchProvider from "next-auth/providers/twitch";
import DiscordProvider from "next-auth/providers/discord";

const isTwitchConfigured = Boolean(
  process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET
);

const isDiscordConfigured = Boolean(
  process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
);

export function buildProviders(customScope?: string | null, targetProvider?: string | null) {
  const providers: any[] = [];

  if (isTwitchConfigured) {
    const twitchScope =
      targetProvider === "twitch" && customScope
        ? customScope
        : "openid user:read:email user:read:follows";

    providers.push(
      TwitchProvider({
        clientId: process.env.TWITCH_CLIENT_ID as string,
        clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            scope: twitchScope,
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

  return providers;
}

export function getAuthOptions(
  customScope?: string | null,
  targetProvider?: string | null,
  knownSessionUserId?: string | null
): NextAuthOptions {
  return {
    adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
    secret:
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "streamsync-dev-auth-secret-key-do-not-use-in-production",
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
      sessionToken: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      callbackUrl: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.callback-url"
            : "next-auth.callback-url",
        options: {
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      csrfToken: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Host-next-auth.csrf-token"
            : "next-auth.csrf-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      pkceCodeVerifier: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.pkce.code_verifier"
            : "next-auth.pkce.code_verifier",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 900,
        },
      },
      state: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.state"
            : "next-auth.state",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 900,
        },
      },
    },
    providers: buildProviders(customScope, targetProvider),
    callbacks: {
      async signIn({ user, account, profile }) {
        if (!account) return true;

        // Handle safe account linking if user is already logged in
        try {
          let currentUserId: string | undefined = knownSessionUserId || undefined;

          if (!currentUserId) {
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

            if (sessionToken) {
              const decoded = await decode({ token: sessionToken, secret });
              currentUserId = (decoded?.id || decoded?.sub) as string | undefined;
            }
          }

          if (currentUserId && process.env.DATABASE_URL) {
              // Check if external account already belongs to another user
              const existingAccount = await prisma.account.findUnique({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
              });

              if (existingAccount && existingAccount.userId !== currentUserId) {
                // Account already linked to another user: reject forbidden merge!
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

                if (account.provider === "twitch") {
                  const twitchName =
                    (profile as any)?.preferred_username ||
                    (profile as any)?.login ||
                    user?.name;
                  if (twitchName) {
                    await prisma.user.update({
                      where: { id: currentUserId },
                      data: { twitchUsername: twitchName },
                    });
                  }
                }

                return "/profile?linked=" + encodeURIComponent(account.provider);
              } else {
                // Update tokens and scope if linking again (e.g. elevated permissions)
                await prisma.account.update({
                  where: { id: existingAccount.id },
                  data: {
                    access_token: account.access_token ?? existingAccount.access_token,
                    refresh_token:
                      account.refresh_token ?? existingAccount.refresh_token,
                    scope: account.scope ?? existingAccount.scope,
                    expires_at: account.expires_at ?? existingAccount.expires_at,
                  },
                });
                return "/profile?linked=" + encodeURIComponent(account.provider);
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
        if (token?.id) {
          session.user = {
            ...(session.user || {}),
            id: token.id as string,
            username:
              (token.username as string) ||
              (session.user?.name
                ? session.user.name.toLowerCase().replace(/\s+/g, "")
                : "usuario"),
          };
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
}

export const authOptions: NextAuthOptions = getAuthOptions();

export function getProvidersStatus() {
  return {
    twitch: isTwitchConfigured,
    discord: isDiscordConfigured,
  };
}
