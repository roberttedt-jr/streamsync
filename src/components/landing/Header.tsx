"use client";

import React, { useState } from "react";
import { Gamepad2, Sparkles, Menu, X, ArrowRight } from "lucide-react";

interface HeaderProps {
  onCreateRoom: () => void;
}

export default function Header({ onCreateRoom }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              Gaming Watch Parties
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a
            href="#como-funciona"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            Cómo funciona
          </a>
          <a
            href="#caracteristicas"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            Características
          </a>
          <a
            href="#testimonios"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            Comunidad
          </a>
          <a
            href="#contacto"
            className="hover:text-neon-cyan transition-colors duration-200"
          >
            Contacto
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onCreateRoom}
            className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-[#6D28D9] border border-purple-500/30 hover:border-neon-cyan/60 shadow-lg shadow-brand-purple/30 hover:shadow-glow-purple transition-all duration-300 active:scale-95 group"
          >
            <Sparkles className="h-4 w-4 text-neon-cyan transition-transform group-hover:rotate-12" />
            <span>Crear sala</span>
            <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface border border-surfaceBorder"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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
              Cómo funciona
            </a>
            <a
              href="#caracteristicas"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              Características
            </a>
            <a
              href="#testimonios"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              Comunidad
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              Contacto
            </a>
          </nav>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onCreateRoom();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-[#6D28D9] shadow-lg shadow-purple-900/40"
            >
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <span>Crear sala gratis</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
