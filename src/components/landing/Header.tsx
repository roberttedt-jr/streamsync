"use client";

import React, { useState } from "react";
import { Gamepad2, Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface HeaderProps {
  onCreateRoom: () => void;
}

export default function Header({ onCreateRoom }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleCreateRoom = () => {
    trackEvent("create_room_click", { location: "header" });
    onCreateRoom();
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="w-full glass-panel rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl shadow-black/80 pointer-events-auto transition-all duration-300">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-brand-purple via-[#7C3AED] to-neon-cyan p-[1px] shadow-lg shadow-brand-purple/20 transition-transform duration-300 group-hover:scale-105">
              <div className="h-full w-full rounded-full bg-[#070A10] flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 text-neon-cyan group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-white flex items-center gap-0.5">
                STREAM<span className="text-neon-cyan">SYNC</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase -mt-0.5 hidden sm:inline">
                {t.header.tagline}
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-300">
            <a
              href="#como-funciona"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              {t.header.howItWorks}
            </a>
            <a
              href="#caracteristicas"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              {t.header.features}
            </a>
            <a
              href="#testimonios"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              {t.header.community}
            </a>
            <a
              href="#contacto"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              {t.header.contact}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center glass-pill rounded-full p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setLanguage("es")}
                className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
                  language === "es"
                    ? "bg-neon-cyan/20 text-neon-cyan shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
                  language === "en"
                    ? "bg-neon-cyan/20 text-neon-cyan shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={handleCreateRoom}
              className="liquid-btn-primary rounded-full px-5 py-2 text-xs font-bold text-white flex items-center gap-1.5 group cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
              <span>{t.header.createRoom}</span>
              <ArrowRight className="h-3.5 w-3.5 text-white/80 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="glass-pill px-2.5 py-1 rounded-full text-xs font-bold text-neon-cyan"
            >
              {language.toUpperCase()}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full glass-pill text-gray-300 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="w-full mt-2 glass-panel rounded-3xl p-5 space-y-4 shadow-2xl pointer-events-auto md:hidden animate-in fade-in zoom-in-95 duration-200">
            <nav className="flex flex-col gap-2 text-sm font-medium text-gray-300">
              <a
                href="#como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/[0.05] hover:text-white transition"
              >
                {t.header.howItWorks}
              </a>
              <a
                href="#caracteristicas"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/[0.05] hover:text-white transition"
              >
                {t.header.features}
              </a>
              <a
                href="#testimonios"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/[0.05] hover:text-white transition"
              >
                {t.header.community}
              </a>
              <a
                href="#contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/[0.05] hover:text-white transition"
              >
                {t.header.contact}
              </a>
            </nav>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCreateRoom();
              }}
              className="w-full liquid-btn-primary rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span>{t.header.createRoomFree}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
