"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  twitchUsername?: string;
  isGuest?: boolean;
  statsHoursWatched?: number;
  statsRoomsCreated?: number;
  statsRoomsJoined?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (nickname?: string) => Promise<{ success: boolean }>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    twitchUsername?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  linkTwitch: (channel: string) => Promise<{ success: boolean; error?: string }>;
  unlinkTwitch: () => Promise<{ success: boolean; error?: string }>;
  incrementRoomsCreated: () => void;
  incrementRoomsJoined: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("streamsync_auth_user", JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem("streamsync_auth_user");
      }
    } catch {}
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("streamsync_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}

    refreshUser().finally(() => setIsLoading(false));
  }, []);


  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Credenciales incorrectas" };
      }
      setUser(data.user);
      localStorage.setItem("streamsync_auth_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al conectar con el servidor" };
    }
  };

  const loginAsGuest = async (nickname?: string) => {
    const randomHex = Math.random().toString(36).substring(2, 6);
    const guestName = nickname?.trim() || `Gamer_${randomHex}`;
    const initials = guestName.slice(0, 2).toUpperCase();
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: guestName,
      username: guestName.toLowerCase().replace(/\s+/g, "_"),
      email: `${guestName.toLowerCase()}@guest.streamsync`,
      avatar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%238B5CF6"/><text x="50%" y="54%" font-size="46" font-family="sans-serif" font-weight="bold" fill="%23FFFFFF" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`,
      isGuest: true,
      statsHoursWatched: 1.2,
      statsRoomsCreated: 0,
      statsRoomsJoined: 1,
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem("streamsync_auth_user", JSON.stringify(guestUser));
    return { success: true };
  };

  const register = async (userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    twitchUsername?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Error al crear cuenta" };
      }
      setUser(data.user);
      localStorage.setItem("streamsync_auth_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al registrarse" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    localStorage.removeItem("streamsync_auth_user");
  };

  const incrementRoomsCreated = () => {
    if (!user) return;
    const updated = { ...user, statsRoomsCreated: (user.statsRoomsCreated || 0) + 1 };
    setUser(updated);
    localStorage.setItem("streamsync_auth_user", JSON.stringify(updated));
  };

  const incrementRoomsJoined = () => {
    if (!user) return;
    const updated = { ...user, statsRoomsJoined: (user.statsRoomsJoined || 0) + 1 };
    setUser(updated);
    localStorage.setItem("streamsync_auth_user", JSON.stringify(updated));
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: "No hay sesión activa" };

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...updates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const updatedLocal = { ...user, ...updates };
        setUser(updatedLocal);
        localStorage.setItem("streamsync_auth_user", JSON.stringify(updatedLocal));
        return { success: true };
      }
      setUser(data.user);
      localStorage.setItem("streamsync_auth_user", JSON.stringify(data.user));
      return { success: true };
    } catch {
      const updatedLocal = { ...user, ...updates };
      setUser(updatedLocal);
      localStorage.setItem("streamsync_auth_user", JSON.stringify(updatedLocal));
      return { success: true };
    }
  };

  const linkTwitch = async (channel: string) => {
    const clean = channel.trim().toLowerCase().replace(/^https?:\/\/(www\.)?twitch\.tv\//, "").replace(/^@/, "");
    return updateProfile({ twitchUsername: clean });
  };

  const unlinkTwitch = async () => {
    return updateProfile({ twitchUsername: "" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginAsGuest,
        register,
        logout,
        refreshUser,
        updateProfile,
        linkTwitch,
        unlinkTwitch,
        incrementRoomsCreated,
        incrementRoomsJoined,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
