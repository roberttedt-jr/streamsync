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
    <section className="relative py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[750px] h-[450px] bg-gradient-to-r from-neon-cyan/20 via-brand-purple/25 to-neon-pink/20 blur-[160px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] glass-panel p-8 sm:p-16 text-center shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-16 right-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 rounded-full text-gray-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan animate-pulse" />
            <span>{t.cta.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            {t.cta.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              {t.cta.titleHighlight}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed font-normal">
            {t.cta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={handleCreateRoom}
              className="liquid-btn-primary rounded-2xl px-10 py-5 text-base sm:text-lg font-bold text-white flex items-center justify-center gap-3 w-full sm:w-auto cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" />
              <span>{t.cta.button}</span>
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-gray-400 font-medium pt-6 border-t border-white/[0.06] max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-neon-cyan" />
              <span>{t.cta.trustFree}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-neon-purple" />
              <span>{t.cta.trustNoInstall}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neon-pink" />
              <span>{t.cta.trustUnlimited}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
