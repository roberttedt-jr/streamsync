"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Gamepad2,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings,
  Plus,
  Compass,
  LayoutDashboard,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface NavbarProps {
  onCreateRoom?: () => void;
}

export default function Navbar({ onCreateRoom }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateRoom = () => {
    if (onCreateRoom) {
      onCreateRoom();
    } else {
      const randomCode = Math.random().toString(36).substring(2, 8);
      router.push(`/room/${randomCode}`);
    }
  };

  const navLinks = [
    { label: t?.nav?.home || (language === "en" ? "Home" : "Inicio"), href: "/" },
    { label: t?.nav?.dashboard || (language === "en" ? "Dashboard" : "Panel"), href: "/dashboard" },
    { label: t?.nav?.explore || (language === "en" ? "Explore" : "Explorar"), href: "/explore" },
  ];

  return (
    <nav className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 pointer-events-none mb-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="w-full glass-panel rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto transition-all">
          {/* Brand Logo & Isotype */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative h-8 w-8 shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/streamsync-logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1 font-heading">
                Stream<span className="text-violet-400">Sync</span>
              </span>
            </div>
          </Link>

          {/* Center Navigation links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-400">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    active
                      ? "text-white font-semibold border-b-2 border-violet-500"
                      : "hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Controls: Language, User/Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Pill */}
            <div className="flex items-center glass-pill rounded-lg p-0.5 text-[11px] font-medium border border-white/10">
              <button
                onClick={() => setLanguage("es")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  language === "es"
                    ? "bg-white/[0.15] text-white font-bold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  language === "en"
                    ? "bg-white/[0.15] text-white font-bold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            {/* User Session or Login Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-xs font-semibold text-gray-200 max-w-[90px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0D111A] border border-white/[0.1] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">@{user.username}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-violet-400" />
                      <span>{t?.nav?.dashboard || (language === "en" ? "Dashboard" : "Mi Dashboard")}</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span>{t?.nav?.profile || (language === "en" ? "My Profile" : "Mi Perfil & Canales")}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleCreateRoom();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t?.nav?.createRoom || (language === "en" ? "Create Room" : "Crear Nueva Sala")}</span>
                    </button>

                    <div className="border-t border-white/[0.06] my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{t?.nav?.logout || (language === "en" ? "Sign out" : "Cerrar Sesión")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition cursor-pointer"
                >
                  {t?.nav?.login || (language === "en" ? "Sign in" : "Entrar")}
                </Link>
                <Link
                  href="/auth?tab=register"
                  className="liquid-btn-primary rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  {language === "en" ? "Register" : "Registro"}
                </Link>
              </div>
            )}

            {/* Quick Room CTA */}
            <button
              onClick={handleCreateRoom}
              className="liquid-btn-secondary rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-violet-400" />
              <span>{t?.nav?.createRoom || (language === "en" ? "Create Room" : "Crear Sala")}</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05]"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto rounded-2xl glass-panel p-4 pointer-events-auto space-y-3">
          <div className="flex flex-col space-y-1 text-xs font-medium text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl transition ${
                  pathname === link.href ? "bg-white/[0.08] text-white font-bold" : "hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/[0.04]"
              >
                {t?.nav?.profile || (language === "en" ? "My Profile" : "Mi Perfil & Canales")}
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="px-2.5 py-1 rounded text-xs bg-white/[0.06] border border-white/[0.1] text-gray-200 font-bold cursor-pointer"
              >
                {language.toUpperCase()}
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-200">@{user.username}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="p-1.5 text-red-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="text-xs bg-white text-black px-3 py-1.5 rounded-xl font-bold cursor-pointer"
              >
                {t?.nav?.login || (language === "en" ? "Sign in / Register" : "Entrar / Registro")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
