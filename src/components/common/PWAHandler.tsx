"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, AlertTriangle } from "lucide-react";

export default function PWAHandler() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 1. Safe Service Worker registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // SW successfully registered
          })
          .catch((err) => {
            console.warn("ServiceWorker registration failed:", err);
          });
      });
    }

    // 2. Online / Offline network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-red-600/90 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-red-400/40 animate-in fade-in slide-in-from-top-2 duration-200">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Sin conexión. Reconectando...</span>
    </div>
  );
}
