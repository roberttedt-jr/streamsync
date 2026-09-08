"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Radio, Users, Mic, ArrowRight, Check, X } from "lucide-react";

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("streamsync_onboarding_seen");
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const steps = [
    {
      icon: Radio,
      title: "Sincronización Total al Milisegundo",
      description:
        "Disfruta de directos de Twitch y vídeos de YouTube con tus amigos. Cuando cualquiera pausa o adelanta, todos se sincronizan automáticamente sin spoilers.",
      badge: "Paso 1 de 3",
      accent: "from-violet-500 to-indigo-500",
    },
    {
      icon: Mic,
      title: "Voz en Tiempo Real & Turnos para Hablar",
      description:
        "Habla con tu squad con audio WebRTC ultrarrápido y sin lag. Usa el botón de pedir turno para no interrumpir momentos clave del stream.",
      badge: "Paso 2 de 3",
      accent: "from-cyan-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Tu Perfil Gamer & Canales Vinculados",
      description:
        "Inicia sesión con Twitch o YouTube para sincronizar tus canales seguidos y ver tus streams favoritos en grupo con un solo clic.",
      badge: "Paso 3 de 3",
      accent: "from-emerald-500 to-teal-500",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem("streamsync_onboarding_seen", "true");
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0D111A] border border-white/[0.1] shadow-2xl p-6 overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-gray-300 mb-6">
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span>{current.badge}</span>
        </div>

        <div className={`h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br ${current.accent} p-[1px] mb-5 shadow-lg shadow-violet-500/10`}>
          <div className="h-full w-full rounded-[15px] bg-[#07090E] flex items-center justify-center">
            <StepIcon className="h-8 w-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight mb-2.5 font-heading">
          {current.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto mb-6">
          {current.description}
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? "w-6 bg-violet-500" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/[0.04] transition"
          >
            Saltar
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
          >
            <span>{currentStep === steps.length - 1 ? "¡Empezar!" : "Siguiente"}</span>
            {currentStep === steps.length - 1 ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
