"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { trackEvent } from "@/lib/analytics";

function LandingContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("register");
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);
  const [pendingRoomCreate, setPendingRoomCreate] = useState<{ platform: "twitch" | "youtube"; channel: string } | null>(null);

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      const hasDismissed = sessionStorage.getItem("streamsync_welcomed");
      if (!hasDismissed) {
        setAuthModalTab("register");
        setAuthModalNotice("¡Bienvenido a StreamSync! Crea tu cuenta gamer para disfrutar de watch parties sincronizadas.");
        setAuthModalOpen(true);
      }
    }
  }, [isLoading, user]);

  const executeCreateRoom = async (platform: "twitch" | "youtube" = "twitch", channel: string = "") => {
    const randomCode = Math.random().toString(36).substring(2, 8);

    try {
      fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: randomCode,
          name: `Watch Party de ${user?.name || "Gamer"}`,
          platform,
          channel,
          hostId: user?.id,
        }),
      }).catch(() => {});
    } catch {}

    if (channel && channel.trim()) {
      router.push(`/party/${randomCode}?stream=${encodeURIComponent(channel)}&platform=${platform}`);
    } else {
      router.push(`/party/${randomCode}`);
    }
  };

  const handleCreateRoomRequest = (platform: "twitch" | "youtube" = "twitch", channel: string = "") => {
    if (!user) {
      setPendingRoomCreate({ platform, channel });
      setAuthModalTab("register");
      setAuthModalNotice("Debes tener una cuenta para crear una watch party. ¡Regístrate en pocos segundos!");
      setAuthModalOpen(true);
      return;
    }

    executeCreateRoom(platform, channel);
  };

  const handleAuthSuccess = () => {
    if (pendingRoomCreate) {
      const { platform, channel } = pendingRoomCreate;
      setPendingRoomCreate(null);
      executeCreateRoom(platform, channel);
    }
  };

  const handleCloseAuthModal = () => {
    sessionStorage.setItem("streamsync_welcomed", "true");
    setAuthModalOpen(false);
    setPendingRoomCreate(null);
    setAuthModalNotice(null);
  };

  return (
    <div className="relative min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-between selection:bg-white selection:text-black">
      <Header
        onCreateRoom={() => handleCreateRoomRequest()}
        onOpenRoomWithChannel={(plat, chan) => handleCreateRoomRequest(plat, chan)}
      />
      <main className="flex-1 flex flex-col">
        <Hero onCreateRoom={() => handleCreateRoomRequest()} />
        <HowItWorks onCreateRoom={() => handleCreateRoomRequest()} />
        <Features />
      </main>
      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        defaultTab={authModalTab}
        notice={authModalNotice}
        onSuccess={handleAuthSuccess}
      />
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
