import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  twitchUsername?: string;
  youtubeHandle?: string;
  createdAt: string;
}

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

const memoryUsers = new Map<string, StoredUser>();
const activeSessions = new Map<string, string>();

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
];

export function getDefaultAvatars(): string[] {
  return DEFAULT_AVATARS;
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  twitchUsername?: string;
  youtubeHandle?: string;
}): Promise<UserProfile> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedUsername = data.username.trim().toLowerCase().replace(/^@/, "");

  for (const user of memoryUsers.values()) {
    if (user.email === normalizedEmail) {
      throw new Error("El correo electrónico ya está registrado");
    }
    if (user.username === normalizedUsername) {
      throw new Error("El nombre de usuario ya está en uso");
    }
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(data.password, salt);
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const avatar = data.avatar || DEFAULT_AVATARS[0];

  const newUser: StoredUser = {
    id,
    name: data.name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    avatar,
    bio: data.bio || "",
    twitchUsername: data.twitchUsername ? data.twitchUsername.trim().toLowerCase().replace(/^https?:\/\/(www\.)?twitch\.tv\//, "") : "",
    youtubeHandle: data.youtubeHandle ? data.youtubeHandle.trim().replace(/^https?:\/\/(www\.)?youtube\.com\//, "") : "",
    createdAt: new Date().toISOString(),
    passwordHash,
    salt,
  };

  memoryUsers.set(id, newUser);

  try {
    await prisma.user.create({
      data: {
        id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        image: newUser.avatar,
      },
    });
  } catch {}

  const { passwordHash: _, salt: __, ...publicProfile } = newUser;
  return publicProfile;
}

export async function authenticateUser(
  identifier: string,
  password: string
): Promise<UserProfile | null> {
  const cleanId = identifier.trim().toLowerCase().replace(/^@/, "");

  let foundUser: StoredUser | null = null;
  for (const user of memoryUsers.values()) {
    if (user.email === cleanId || user.username === cleanId) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanId }, { username: cleanId }],
        },
      });
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name || "Gamer",
          username: dbUser.username || "gamer",
          email: dbUser.email || "",
          avatar: dbUser.image || DEFAULT_AVATARS[0],
          createdAt: dbUser.createdAt.toISOString(),
        };
      }
    } catch {}
    return null;
  }

  const checkHash = hashPassword(password, foundUser.salt);
  if (checkHash !== foundUser.passwordHash) {
    return null;
  }

  const { passwordHash: _, salt: __, ...publicProfile } = foundUser;
  return publicProfile;
}

export function createSession(userId: string): string {
  const token = generateSessionToken();
  activeSessions.set(token, userId);
  return token;
}

export function verifySession(token: string): UserProfile | null {
  const userId = activeSessions.get(token);
  if (!userId) return null;

  const user = memoryUsers.get(userId);
  if (!user) return null;

  const { passwordHash: _, salt: __, ...publicProfile } = user;
  return publicProfile;
}

export function removeSession(token: string): void {
  activeSessions.delete(token);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "name" | "username" | "avatar" | "bio" | "twitchUsername" | "youtubeHandle">>
): Promise<UserProfile> {
  const user = memoryUsers.get(userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (updates.username) {
    const cleanUsername = updates.username.trim().toLowerCase().replace(/^@/, "");
    for (const [otherId, other] of memoryUsers.entries()) {
      if (otherId !== userId && other.username === cleanUsername) {
        throw new Error("El nombre de usuario ya está ocupado");
      }
    }
    user.username = cleanUsername;
  }

  if (updates.name !== undefined) user.name = updates.name.trim();
  if (updates.avatar !== undefined) user.avatar = updates.avatar.trim();
  if (updates.bio !== undefined) user.bio = updates.bio.trim();
  if (updates.twitchUsername !== undefined) {
    user.twitchUsername = updates.twitchUsername
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\/(www\.)?twitch\.tv\//, "")
      .replace(/^@/, "");
  }
  if (updates.youtubeHandle !== undefined) {
    user.youtubeHandle = updates.youtubeHandle
      .trim()
      .replace(/^https?:\/\/(www\.)?youtube\.com\//, "");
  }

  memoryUsers.set(userId, user);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: user.name,
        username: user.username,
        image: user.avatar,
      },
    });
  } catch {}

  const { passwordHash: _, salt: __, ...publicProfile } = user;
  return publicProfile;
}
