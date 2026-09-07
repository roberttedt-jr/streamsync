"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
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

  const handleCreateRoom = async (platform: "twitch" | "youtube" = "twitch", channel: string = "ibai") => {
    const randomCode = Math.random().toString(36).substring(2, 8);

    try {
      fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: randomCode,
          name: `Watch Party ${randomCode.toUpperCase()}`,
          platform,
          channel,
        }),
      }).catch(() => {});
    } catch {}

    router.push(`/party/${randomCode}`);
  };

  const handleOpenRoomWithChannel = (platform: "twitch" | "youtube", channel: string) => {
    handleCreateRoom(platform, channel);
  };

  return (
    <div className="relative min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-between selection:bg-white selection:text-black">
      <Header
        onCreateRoom={() => handleCreateRoom("twitch", "ibai")}
        onOpenRoomWithChannel={handleOpenRoomWithChannel}
      />
      <main className="flex-1 flex flex-col">
        <Hero onCreateRoom={() => handleCreateRoom("twitch", "ibai")} />
        <HowItWorks onCreateRoom={() => handleCreateRoom("twitch", "ibai")} />
        <Features />
        <Testimonials />
        <CTA onCreateRoom={() => handleCreateRoom("twitch", "ibai")} />
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LandingContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
