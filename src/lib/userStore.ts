import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
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

const STORAGE_FILE = path.join(os.tmpdir(), "streamsync_users_store.json");

function loadStoredUsers(): Map<string, StoredUser> {
  const map = new Map<string, StoredUser>();
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.id) map.set(item.id, item);
        }
      }
    }
  } catch {}
  return map;
}

function persistUsersToFile(map: Map<string, StoredUser>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list), "utf-8");
  } catch {}
}

const memoryUsers = loadStoredUsers();
const activeSessions = new Map<string, string>();

export const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=MechaZero&backgroundColor=0d0f17",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=ApexHero&backgroundColor=0d0f17",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ShadowWolf&backgroundColor=0d0f17",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=CyberFox&backgroundColor=0d0f17",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=GamerPanda&backgroundColor=0d0f17",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelWarrior&backgroundColor=0d0f17",
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
  persistUsersToFile(memoryUsers);

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
    const refreshed = loadStoredUsers();
    for (const user of refreshed.values()) {
      if (user.email === cleanId || user.username === cleanId) {
        foundUser = user;
        memoryUsers.set(user.id, user);
        break;
      }
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

  let user = memoryUsers.get(userId);
  if (!user) {
    const refreshed = loadStoredUsers();
    user = refreshed.get(userId);
    if (user) memoryUsers.set(userId, user);
  }
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
  let user = memoryUsers.get(userId);
  if (!user) {
    const refreshed = loadStoredUsers();
    user = refreshed.get(userId);
  }
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
  persistUsersToFile(memoryUsers);

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
