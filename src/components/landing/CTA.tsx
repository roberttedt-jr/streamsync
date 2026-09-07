"use client";

import React from "react";
import { Play, Sparkles, Shield, Zap, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface CTAProps {
  onCreateRoom: () => void;
}

export default function CTA({ onCreateRoom }: CTAProps) {
  const { t } = useLanguage();

  const handleCreateRoom = () => {
    trackEvent("create_room_click", { location: "final_cta" });
    onCreateRoom();
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background radial lighting */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[600px] h-[350px] bg-gradient-to-r from-brand-purple/25 via-neon-cyan/25 to-neon-pink/25 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-surfaceBorder/80 bg-gradient-to-b from-[#0F141C] to-[#0B0F14] p-8 sm:p-14 text-center shadow-2xl shadow-black/80 overflow-hidden group">
          {/* Subtle grid pattern inside */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#80808022_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Glowing border hover effect */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-neon-cyan/20 blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surfaceBorder text-gray-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan animate-pulse" />
            <span>{t.cta.badge}</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {t.cta.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              {t.cta.titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed">
            {t.cta.subtitle}
          </p>

          {/* Big CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleCreateRoom}
              className="relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 sm:py-5 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-brand-purple via-[#7C3AED] to-neon-cyan border border-white/20 shadow-2xl shadow-brand-purple/50 hover:shadow-glow-purple hover:scale-[1.03] active:scale-95 transition-all duration-300 group"
            >
              <Play className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" />
              <span>{t.cta.button}</span>
              <Sparkles className="h-4 w-4 text-neon-cyan" />
            </button>
          </div>

          {/* 3 bullet micro-guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium pt-4 border-t border-surfaceBorder/60 max-w-md mx-auto">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-neon-cyan" />
              <span>{t.cta.trustFree}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-neon-purple" />
              <span>{t.cta.trustNoInstall}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-neon-pink" />
              <span>{t.cta.trustUnlimited}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
