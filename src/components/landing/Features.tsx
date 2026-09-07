"use client";

import React from "react";
import { Zap, Mic, BarChart3, ShieldCheck, Gamepad2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      ...t.features.feat1,
      icon: Zap,
      glow: "from-neon-cyan/20 to-transparent",
      iconStyle: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
    },
    {
      ...t.features.feat2,
      icon: Mic,
      glow: "from-neon-purple/20 to-transparent",
      iconStyle: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
    },
    {
      ...t.features.feat3,
      icon: BarChart3,
      glow: "from-neon-pink/20 to-transparent",
      iconStyle: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
    },
    {
      ...t.features.feat4,
      icon: ShieldCheck,
      glow: "from-emerald-500/20 to-transparent",
      iconStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <section id="caracteristicas" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Deep ambient refraction light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-transparent blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 rounded-full text-neon-cyan text-xs font-bold uppercase tracking-widest mb-5">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>{t.features.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            {t.features.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {t.features.titleHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Bento Liquid Glass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl glass-card p-8 sm:p-9 flex flex-col justify-between overflow-hidden"
              >
                {/* Top glossy specular reflection */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Subtle fluid glow behind card on hover */}
                <div
                  className={`absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-tl ${feat.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="flex items-start gap-6">
                  {/* Glass Icon */}
                  <div
                    className={`h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${feat.iconStyle}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {feat.title}
                      </h3>
                      <span className="text-[11px] font-mono glass-pill text-gray-400 px-2.5 py-0.5 rounded-full">
                        {feat.subtitle}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed mb-5 font-normal">
                      {feat.description}
                    </p>

                    {/* Example Capsule */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-xs text-gray-400 leading-relaxed backdrop-blur-md">
                      <span className="font-semibold text-gray-200">{t.features.practiceLabel} </span>
                      {feat.example}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
