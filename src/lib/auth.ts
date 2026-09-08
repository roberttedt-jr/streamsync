import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "streamsync-super-secret-key-12345",
  session: {
    strategy: "jwt",
  },
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID || "",
      clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid user:read:email chat:read chat:edit",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
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
