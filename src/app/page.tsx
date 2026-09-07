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
    // Generate a random clean 6-character alphanumeric code
    const randomCode = Math.random().toString(36).substring(2, 8);

    // Call persistent room register API asynchronously in background
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
    <div className="relative min-h-screen bg-[#0B0F14] text-[#F3F4F6] flex flex-col justify-between selection:bg-brand-purple selection:text-white">
      {/* Persistent global subtle top ambient gradient */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-brand-purple to-neon-pink z-50" />

      {/* Header */}
      <Header onCreateRoom={handleCreateRoom} />

      {/* Main Content Sections */}
      <main className="flex-1 flex flex-col">
        <Hero onCreateRoom={handleCreateRoom} />
        <HowItWorks onCreateRoom={handleCreateRoom} />
        <Features />
        <Testimonials />
        <CTA onCreateRoom={handleCreateRoom} />
      </main>

      {/* Footer */}
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
