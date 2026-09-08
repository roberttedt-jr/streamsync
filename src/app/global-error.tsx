"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StreamSync Global Error:", error?.message || "Unknown error");
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-[#090B10] text-[#E2E8F0] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">
              Algo ha fallado al iniciar la interfaz
            </h2>
            <p className="text-xs text-gray-400">
              Ocurrió un error inesperado. Pulsa reintentar para restablecer la sesión o vuelve al inicio.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>

            <a
              href="/"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold inline-flex items-center gap-2 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ir al inicio</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
