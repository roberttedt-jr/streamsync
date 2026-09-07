"use client";

import React from "react";
import { Sparkles, Tv, Share2, Headphones, ArrowRight, CheckCircle2 } from "lucide-react";

interface HowItWorksProps {
  onCreateRoom: () => void;
}

export default function HowItWorks({ onCreateRoom }: HowItWorksProps) {
  const steps = [
    {
      number: "01",
      icon: Tv,
      accentColor: "neon-cyan",
      borderColor: "group-hover:border-neon-cyan/50",
      glowColor: "group-hover:shadow-glow-cyan",
      badgeColor: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
      title: "Crea tu sala",
      description:
        "Elige si quieres ver un canal de Twitch o un vídeo de YouTube. Dale un nombre a tu sala y busca el stream con un solo clic.",
      details: ["Soporte nativo Twitch & YouTube", "Salas públicas o con clave", "Sin esperas ni registros"],
    },
    {
      number: "02",
      icon: Share2,
      accentColor: "neon-purple",
      borderColor: "group-hover:border-neon-purple/50",
      glowColor: "group-hover:shadow-glow-purple",
      badgeColor: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
      title: "Invita a tus amigos",
      description:
        "Copia el enlace generado de tu sala y compártelo en tu servidor de Discord, WhatsApp o grupo de Telegram al instante.",
      details: ["Enlace directo de un solo clic", "Acceso instantáneo desde navegador", "Sin apps obligatorias"],
    },
    {
      number: "03",
      icon: Headphones,
      accentColor: "neon-pink",
      borderColor: "group-hover:border-neon-pink/50",
      glowColor: "group-hover:shadow-glow-pink",
      badgeColor: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
      title: "Ver y hablar en tiempo real",
      description:
        "Vídeo sincronizado al milisegundo para todos. Activa el chat de voz integrado y sigue las estadísticas competitivas de la partida.",
      details: ["Sincronización milimétrica", "Chat de voz WebRTC ultra ligero", "Overlay con stats del juego"],
    },
  ];

  return (
    <section id="como-funciona" className="relative py-20 lg:py-28 bg-[#0B0F14]/70 border-t border-surfaceBorder/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            3 pasos sencillos
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Empieza tu watch party en{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              30 segundos
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Olvídate de cuentas atrás manuales o streams desfasados. StreamSync coordina todo automáticamente en la nube.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl border border-surfaceBorder bg-[#0F141C]/80 backdrop-blur-sm p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 ${step.borderColor} ${step.glowColor}`}
              >
                {/* Step number watermark */}
                <div className="absolute top-6 right-7 text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors font-mono select-none">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`h-14 w-14 rounded-xl border flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${step.badgeColor}`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span>{step.title}</span>
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Bullet details */}
                <ul className="space-y-2 border-t border-surfaceBorder/60 pt-5">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={onCreateRoom}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-purple to-neon-purple hover:to-neon-cyan shadow-xl shadow-brand-purple/25 hover:shadow-glow-purple active:scale-95 transition-all duration-300"
          >
            <span>Crear tu sala ahora</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
