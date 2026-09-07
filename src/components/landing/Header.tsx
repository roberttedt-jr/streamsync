"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Gamepad2,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings,
  Plus,
  Radio,
  Tv,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import AuthModal from "@/components/auth/AuthModal";
import ProfileModal from "@/components/auth/ProfileModal";

interface HeaderProps {
  onCreateRoom: () => void;
  onOpenRoomWithChannel?: (platform: "twitch" | "youtube", channel: string) => void;
}

export default function Header({ onCreateRoom, onOpenRoomWithChannel }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"login" | "register">("register");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenAuth = (tab: "login" | "register") => {
    setAuthDefaultTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleCreateRoom = () => {
    trackEvent("create_room_click", { location: "header" });
    onCreateRoom();
  };

  return (
    <>
      <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="w-full glass-panel rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto transition-all">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center transition-colors group-hover:border-white/20">
                <Gamepad2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white">
                  Stream<span className="text-gray-400">Sync</span>
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-400">
              <a href="#como-funciona" className="hover:text-white transition-colors">
                {t.header.howItWorks}
              </a>
              <a href="#caracteristicas" className="hover:text-white transition-colors">
                {t.header.features}
              </a>
              <a href="#testimonios" className="hover:text-white transition-colors">
                {t.header.community}
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center glass-pill rounded-lg p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setLanguage("es")}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    language === "es"
                      ? "bg-white/[0.1] text-white font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    language === "en"
                      ? "bg-white/[0.1] text-white font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-6 w-6 rounded-full object-cover border border-white/20"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-[#0D0F17]" />
                    </div>
                    <span className="text-xs font-medium text-gray-200">@{user.username}</span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0D0F17] border border-white/[0.08] shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-white/[0.06]">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">@{user.username}</p>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-gray-400" />
                        <span>Mi Perfil & Conexiones</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleCreateRoom();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 text-gray-400" />
                        <span>Crear Nueva Sala</span>
                      </button>

                      <div className="border-t border-white/[0.06] my-1" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAuth("login")}
                    className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleOpenAuth("register")}
                    className="liquid-btn-primary rounded-xl px-4 py-1.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    Crear Cuenta
                  </button>
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                className="liquid-btn-secondary rounded-xl px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Sala</span>
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-6xl mx-auto rounded-2xl glass-panel p-4 pointer-events-auto space-y-3">
            <div className="flex flex-col space-y-2 text-xs font-medium text-gray-300">
              <a
                href="#como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/[0.05] rounded-lg"
              >
                {t.header.howItWorks}
              </a>
              <a
                href="#caracteristicas"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/[0.05] rounded-lg"
              >
                {t.header.features}
              </a>
              <a
                href="#testimonios"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/[0.05] rounded-lg"
              >
                {t.header.community}
              </a>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLanguage("es")}
                  className={`px-2 py-1 rounded text-xs ${
                    language === "es" ? "bg-white/10 text-white" : "text-gray-400"
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 rounded text-xs ${
                    language === "en" ? "bg-white/10 text-white" : "text-gray-400"
                  }`}
                >
                  EN
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="text-xs font-medium text-white flex items-center gap-1.5"
                  >
                    <img src={user.avatar} className="h-5 w-5 rounded-full" />
                    <span>@{user.username}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1 text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAuth("login")}
                    className="text-xs text-gray-300 px-2 py-1"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => handleOpenAuth("register")}
                    className="text-xs bg-white text-black px-3 py-1 rounded-lg font-bold"
                  >
                    Registro
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenRoomWithChannel={onOpenRoomWithChannel}
      />
    </>
  );
}
