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
  youtubeHandle?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    twitchUsername?: string;
    youtubeHandle?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  linkTwitch: (channel: string) => Promise<{ success: boolean; error?: string }>;
  unlinkTwitch: () => Promise<{ success: boolean; error?: string }>;
  linkYouTube: (handle: string) => Promise<{ success: boolean; error?: string }>;
  unlinkYouTube: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("streamsync_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("streamsync_auth_user", JSON.stringify(data.user));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
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

  const register = async (userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    twitchUsername?: string;
    youtubeHandle?: string;
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

  const linkYouTube = async (handle: string) => {
    const clean = handle.trim().replace(/^https?:\/\/(www\.)?youtube\.com\//, "");
    return updateProfile({ youtubeHandle: clean });
  };

  const unlinkYouTube = async () => {
    return updateProfile({ youtubeHandle: "" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        linkTwitch,
        unlinkTwitch,
        linkYouTube,
        unlinkYouTube,
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
