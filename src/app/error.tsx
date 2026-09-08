"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, User, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log message securely without printing sensitive data or stack traces
    console.error("StreamSync App Error caught by Error Boundary:", error?.message || "Unknown error");
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090B10] text-[#E2E8F0] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">
            Ha ocurrido un problema al cargar la página
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            No te preocupes, tu cuenta y datos permanecen seguros. Puedes reintentar cargar el contenido o volver a tu perfil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="liquid-btn-primary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 hover:scale-105 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/profile"
            className="liquid-btn-secondary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
          >
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Volver al perfil</span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition inline-flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
