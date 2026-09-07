"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, AlertCircle, Gamepad2, Upload, Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [regTwitch, setRegTwitch] = useState("");
  const [regYouTube, setRegYouTube] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("La imagen no debe superar los 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedAvatar(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

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
    const res = await register({
      name: regName.trim() || regUsername.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      avatar: uploadedAvatar || undefined,
      twitchUsername: regTwitch.trim() || undefined,
      youtubeHandle: regYouTube.trim() || undefined,
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0D0F17] border border-white/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {notice && (
          <div className="px-6 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-xs text-gray-300 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-white shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="sticky top-0 z-10 bg-[#0D0F17]/95 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
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
                Foto de Perfil
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="auth-avatar-upload"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-16 w-16 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/50 bg-white/[0.03] flex items-center justify-center cursor-pointer transition overflow-hidden group shrink-0"
                >
                  {uploadedAvatar ? (
                    <img
                      src={uploadedAvatar}
                      alt="Foto seleccionada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white">
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wider">Subir</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-xs">
                  {uploadedAvatar ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                        <Check className="h-3.5 w-3.5" />
                        <span>Foto cargada con éxito</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-gray-400 hover:text-white underline text-[11px] cursor-pointer"
                        >
                          Cambiar foto
                        </button>
                        <span className="text-gray-600">•</span>
                        <button
                          type="button"
                          onClick={() => setUploadedAvatar(null)}
                          className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Quitar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-300 font-medium">Sube tu propia foto o imagen</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        PNG, JPG o WEBP (máx. 3MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-gray-300 hover:text-white text-[11px] flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Seleccionar archivo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

            <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
              <span className="block text-xs font-semibold text-gray-300">
                Vincular Canales (Opcional)
              </span>

              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1.5 focus-within:border-[#9146FF]/50 transition">
                <svg className="h-4 w-4 text-[#9146FF] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Canal de Twitch (ej. tu_canal)"
                  value={regTwitch}
                  onChange={(e) => setRegTwitch(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1.5 focus-within:border-red-500/50 transition">
                <svg className="h-4 w-4 text-[#FF0000] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Canal de YouTube (ej. @tu_canal)"
                  value={regYouTube}
                  onChange={(e) => setRegYouTube(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Creando cuenta..." : "Crear Mi Cuenta"}</span>
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
