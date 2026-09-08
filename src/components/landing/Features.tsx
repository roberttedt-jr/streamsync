"use client";

import React from "react";
import { Users, MessageSquare, Mic, Settings, MonitorSmartphone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Features() {
  const { t } = useLanguage();

  const featureIcons = [Users, MessageSquare, Mic, Settings, MonitorSmartphone];
  const features = (t.features.items || [
    t.features.feat1,
    t.features.feat2,
    t.features.feat3,
    t.features.feat4,
    t.features.feat5,
  ]).map((feat, idx) => ({
    ...feat,
    icon: featureIcons[idx % featureIcons.length],
  }));

  return (
    <section id="caracteristicas" className="py-20 lg:py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-3 block">
            {t.features.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            {t.features.titleStart} {t.features.titleHighlight}
          </h2>
          <p className="text-sm text-gray-400 font-normal leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D0F17] border border-white/[0.08] p-7 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                      {feat.subtitle}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-5 font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 text-xs text-gray-400 leading-relaxed">
                  <span className="font-semibold text-gray-300">{t.features.practiceLabel} </span>
                  {feat.example}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
