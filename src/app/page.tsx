"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { trackEvent } from "@/lib/analytics";

function LandingContent() {
  const router = useRouter();

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  const handleCreateRoom = async () => {
    const randomCode = Math.random().toString(36).substring(2, 8);

    try {
      fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: randomCode,
          name: `Watch Party ${randomCode.toUpperCase()}`,
          platform: "twitch",
          channel: "ibai",
        }),
      }).catch(() => {});
    } catch {}

    router.push(`/party/${randomCode}`);
  };

  return (
    <div className="relative min-h-screen bg-[#05070B] text-[#F8FAFC] flex flex-col justify-between selection:bg-neon-cyan selection:text-black">
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan via-brand-purple to-neon-pink z-50 opacity-90" />
      <Header onCreateRoom={handleCreateRoom} />
      <main className="flex-1 flex flex-col">
        <Hero onCreateRoom={handleCreateRoom} />
        <HowItWorks onCreateRoom={handleCreateRoom} />
        <Features />
        <Testimonials />
        <CTA onCreateRoom={handleCreateRoom} />
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
  );
}
