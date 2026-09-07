"use client";

import React from "react";
import { Sparkles, Tv, Share2, Headphones, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface HowItWorksProps {
  onCreateRoom: () => void;
}

export default function HowItWorks({ onCreateRoom }: HowItWorksProps) {
  const { t } = useLanguage();

  const handleCreateRoom = () => {
    trackEvent("create_room_click", { location: "how_it_works" });
    onCreateRoom();
  };

  const steps = [
    {
      ...t.howItWorks.step1,
      icon: Tv,
      accentGlow: "from-neon-cyan/20 to-transparent",
      iconBg: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
    },
    {
      ...t.howItWorks.step2,
      icon: Share2,
      accentGlow: "from-neon-purple/20 to-transparent",
      iconBg: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
    },
    {
      ...t.howItWorks.step3,
      icon: Headphones,
      accentGlow: "from-neon-pink/20 to-transparent",
      iconBg: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
    },
  ];

  return (
    <section id="como-funciona" className="relative py-24 lg:py-32 overflow-hidden border-t border-white/[0.05]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-purple/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 rounded-full text-neon-purple text-xs font-bold uppercase tracking-widest mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.howItWorks.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            {t.howItWorks.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              {t.howItWorks.titleHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl glass-card p-8 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                <div
                  className={`absolute -top-20 -right-20 w-44 h-44 rounded-full bg-gradient-to-br ${step.accentGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div
                      className={`h-14 w-14 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${step.iconBg}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-4xl font-black font-mono text-white/[0.07] group-hover:text-white/[0.15] transition-colors select-none">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6 font-normal">
                    {step.description}
                  </p>
                </div>

                <ul className="space-y-2.5 pt-5 border-t border-white/[0.06]">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2.5 text-xs text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-neon-cyan shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleCreateRoom}
            className="liquid-btn-primary rounded-2xl px-8 py-4 text-base font-bold text-white flex items-center gap-3 cursor-pointer"
          >
            <span>{t.howItWorks.ctaButton}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
