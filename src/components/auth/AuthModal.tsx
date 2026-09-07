"use client";

import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, Gamepad2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  notice?: string | null;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "register",
  notice,
  onSuccess,
}: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(identifier, loginPassword);
    setLoading(false);
    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Error al iniciar sesión");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regUsername.trim() || regUsername.length < 3) {
      setError("El usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (!regEmail.includes("@")) {
      setError("Introduce un email válido.");
      return;
    }
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const finalAvatar = customAvatarUrl.trim() || selectedAvatar;
    const res = await register({
      name: regName.trim() || regUsername.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      avatar: finalAvatar,
    });
    setLoading(false);

    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Error al registrar la cuenta");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#0D0F17] border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {notice && (
          <div className="px-6 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-xs text-gray-300 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-white shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <button
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Crear Cuenta
            </button>
            <button
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {tab === "register" ? (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Foto de Perfil / Avatar
              </label>
              <div className="flex items-center gap-2.5 mb-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      setCustomAvatarUrl("");
                    }}
                    className={`relative h-11 w-11 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedAvatar === av && !customAvatarUrl
                        ? "border-white scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={av} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                    {selectedAvatar === av && !customAvatarUrl && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <input
                type="url"
                placeholder="O pega una URL de imagen personalizada..."
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Usuario (@handle)</label>
                <input
                  type="text"
                  required
                  placeholder="ej. gamerpro"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Creando cuenta..." : "Crear Mi Cuenta Gamer"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors pt-1 cursor-pointer"
            >
              Explorar como invitado
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Usuario o Correo Electrónico
              </label>
              <input
                type="text"
                required
                placeholder="tu@email.com o @usuario"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Iniciando..." : "Acceder a StreamSync"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors pt-1 cursor-pointer"
            >
              Explorar como invitado
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
