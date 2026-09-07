"use client";

import React from "react";
import { Tv, Share2, Headphones, ArrowRight, Check } from "lucide-react";
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
      number: "01",
      icon: Tv,
      title: t.howItWorks.step1.title,
      description: t.howItWorks.step1.description,
      details: t.howItWorks.step1.details,
    },
    {
      number: "02",
      icon: Share2,
      title: t.howItWorks.step2.title,
      description: t.howItWorks.step2.description,
      details: t.howItWorks.step2.details,
    },
    {
      number: "03",
      icon: Headphones,
      title: t.howItWorks.step3.title,
      description: t.howItWorks.step3.description,
      details: t.howItWorks.step3.details,
    },
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-3 block">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            {t.howItWorks.titleStart} {t.howItWorks.titleHighlight}
          </h2>
          <p className="text-sm text-gray-400 font-normal leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D0F17] border border-white/[0.08] p-7 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-white/20">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6 font-normal">
                    {step.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-4 border-t border-white/[0.06]">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="h-3.5 w-3.5 text-gray-500 shrink-0" />
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
            className="liquid-btn-secondary rounded-xl px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>{t.howItWorks.ctaButton}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
