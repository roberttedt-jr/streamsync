"use client";

import React, { useState } from "react";
import { Gamepad2, Sparkles, Menu, X, ArrowRight, Globe } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-surfaceBorder/70 bg-[#0B0F14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-purple via-[#7C3AED] to-neon-cyan flex items-center justify-center shadow-lg shadow-brand-purple/25 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-glow-purple">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-white">
              STREAM<span className="text-neon-cyan">SYNC</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase -mt-1">
              {t.header.tagline}
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a
            href="#como-funciona"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            {t.header.howItWorks}
          </a>
          <a
            href="#caracteristicas"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            {t.header.features}
          </a>
          <a
            href="#testimonios"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            {t.header.community}
          </a>
          <a
            href="#contacto"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            {t.header.contact}
          </a>
        </nav>

        {/* Desktop Right: Language Selector & CTA */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center bg-surface border border-surfaceBorder rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setLanguage("es")}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === "es"
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === "en"
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={handleCreateRoom}
            className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-[#6D28D9] border border-purple-500/30 hover:border-neon-cyan/60 shadow-lg shadow-brand-purple/30 hover:shadow-glow-purple transition-all duration-300 active:scale-95 group"
          >
            <Sparkles className="h-4 w-4 text-neon-cyan transition-transform group-hover:rotate-12" />
            <span>{t.header.createRoom}</span>
            <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language toggle */}
          <button
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="px-2.5 py-1.5 rounded-lg border border-surfaceBorder bg-surface text-xs font-bold text-neon-cyan"
          >
            {language.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface border border-surfaceBorder"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surfaceBorder bg-[#0B0F14]/95 backdrop-blur-2xl px-6 py-5 space-y-4">
          <nav className="flex flex-col gap-4 text-base font-medium text-gray-300">
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              {t.header.howItWorks}
            </a>
            <a
              href="#caracteristicas"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              {t.header.features}
            </a>
            <a
              href="#testimonios"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              {t.header.community}
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              {t.header.contact}
            </a>
          </nav>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCreateRoom();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-[#6D28D9] shadow-lg shadow-purple-900/40"
            >
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <span>{t.header.createRoomFree}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
