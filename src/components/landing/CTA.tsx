"use client";

import React from "react";
import { Play, Zap, Shield, Users } from "lucide-react";
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
    <section className="py-20 lg:py-28 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0D0F17] border border-white/[0.08] p-8 sm:p-14 text-center">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-3 block">
            {t.cta.badge}
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            {t.cta.titleStart} <span className="text-gray-400">{t.cta.titleHighlight}</span>
          </h2>

          <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed font-normal">
            {t.cta.subtitle}
          </p>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleCreateRoom}
              className="liquid-btn-primary rounded-xl px-7 py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{t.cta.button}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-normal pt-6 border-t border-white/[0.06]">
            <span>{t.cta.trustFree}</span>
            <span>•</span>
            <span>{t.cta.trustNoInstall}</span>
            <span>•</span>
            <span>{t.cta.trustUnlimited}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
