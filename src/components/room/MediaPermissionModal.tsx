"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
  Sparkles,
} from "lucide-react";

interface MediaPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestedType: "voice" | "video";
  onPermissionGranted: (stream: MediaStream, type: "voice" | "video") => void;
  onChooseChatOnly?: () => void;
}

export default function MediaPermissionModal({
  isOpen,
  onClose,
  requestedType,
  onPermissionGranted,
  onChooseChatOnly,
}: MediaPermissionModalProps) {
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedCam, setSelectedCam] = useState<string>("");
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Preview states
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // List devices if permission was already granted previously
  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const mics = devices.filter((d) => d.kind === "audioinput");
          const cams = devices.filter((d) => d.kind === "videoinput");
          setAudioDevices(mics);
          setVideoDevices(cams);
          if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
          if (cams.length > 0 && !selectedCam) setSelectedCam(cams[0].deviceId);
        }
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }
    };

    getDevices();
  }, [isOpen, selectedMic, selectedCam]);

  // Clean up any preview stream when closing modal
  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [previewStream]);

  if (!isOpen) return null;

  // Handle explicit user action to request device access
  const handleRequestAccess = async () => {
    setIsRequesting(true);
    setPermissionError(null);

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        video:
          requestedType === "video"
            ? selectedCam
              ? { deviceId: { exact: selectedCam }, width: { ideal: 640 }, height: { ideal: 360 } }
              : { width: { ideal: 640 }, height: { ideal: 360 } }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Successfully acquired stream
      onPermissionGranted(stream, requestedType);
      onClose();
    } catch (err: any) {
      console.error("getUserMedia error:", err);
      let message = "No se pudo acceder al dispositivo seleccionado.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message =
          "Permiso denegado por el navegador. Haz clic en el icono del candado en la barra de direcciones para autorizar el acceso.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "No se encontró ningún micrófono o cámara conectado.";
      } else if (err.name === "NotReadableError") {
        message = "El dispositivo está ocupado por otra aplicación (Zoom, Discord, OBS, etc.).";
      }
      setPermissionError(message);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0D1017] border border-white/10 shadow-2xl p-6 text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
                requestedType === "video"
                  ? "bg-purple-600/20 border-purple-500/30 text-purple-400 shadow-purple-600/10"
                  : "bg-emerald-600/20 border-emerald-500/30 text-emerald-400 shadow-emerald-600/10"
              }`}
            >
              {requestedType === "video" ? (
                <Video className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {requestedType === "video"
                  ? "Activar Cámara y Micrófono"
                  : "Activar Micrófono en Sala"}
              </h3>
              <p className="text-xs text-gray-400">
                Comunicación opcional en directo con los participantes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy & Trust Badge */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2.5 text-xs text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">100% Opcional y Privado</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              StreamSync solo transmitirá tu audio o vídeo a los miembros presentes en la sala
              mientras esté activa. No se graba ni se almacena ninguna información.
            </p>
          </div>
        </div>

        {/* Error notice if permission was denied */}
        {permissionError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Permiso no concedido:</span>
              <p className="text-[11px] text-red-200/90">{permissionError}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleRequestAccess}
            disabled={isRequesting}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50 ${
              requestedType === "video"
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {isRequesting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Solicitando autorización...</span>
              </span>
            ) : (
              <>
                {requestedType === "video" ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                <span>
                  {requestedType === "video"
                    ? "Permitir y unirme con cámara"
                    : "Permitir y unirme a la voz"}
                </span>
              </>
            )}
          </button>

          {onChooseChatOnly && (
            <button
              onClick={() => {
                onChooseChatOnly();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Prefiero continuar solo con chat de texto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
