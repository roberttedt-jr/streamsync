"use client";

import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Crown, Maximize2 } from "lucide-react";

interface ParticipantMedia {
  id: string;
  name: string;
  avatar?: string | null;
  isHost?: boolean;
  micActive: boolean;
  cameraActive: boolean;
  isSpeaking?: boolean;
  stream?: MediaStream | null;
}

interface VideoGridProps {
  localParticipant: ParticipantMedia;
  remoteParticipants: ParticipantMedia[];
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
}

function VideoTile({
  participant,
  isLocal = false,
}: {
  participant: ParticipantMedia;
  isLocal?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  useEffect(() => {
    if (audioRef.current && participant.stream && !isLocal) {
      audioRef.current.srcObject = participant.stream;
    }
  }, [participant.stream, isLocal]);

  const hasVideoTrack =
    participant.cameraActive &&
    participant.stream &&
    participant.stream.getVideoTracks().length > 0 &&
    participant.stream.getVideoTracks()[0].enabled;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0A0D14] border transition-all duration-200 aspect-video flex items-center justify-center min-w-[140px] max-w-[240px] flex-1 shrink-0 ${
        participant.isSpeaking
          ? "border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40"
          : "border-white/10"
      }`}
    >
      {/* Hidden Audio for remote participants without video */}
      {!hasVideoTrack && !isLocal && participant.stream && (
        <audio ref={audioRef} autoPlay playsInline className="hidden" />
      )}

      {/* Video Element if camera is active */}
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent audio feedback
          className={`w-full h-full object-cover ${isLocal ? "-scale-x-100" : ""}`}
        />
      ) : (
        /* Fallback Avatar */
        <div className="flex flex-col items-center justify-center p-3 text-center">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs text-white border-2 shadow-md transition-all ${
              participant.isSpeaking
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-purple-600/20 border-purple-500/30 text-purple-200"
            }`}
          >
            {participant.avatar ? (
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              (participant.name || "U").slice(0, 2).toUpperCase()
            )}
          </div>
          <span className="text-[10px] font-semibold text-gray-300 mt-1.5 truncate max-w-[100px]">
            {participant.name} {isLocal ? "(Tú)" : ""}
          </span>
        </div>
      )}

      {/* Overlay Badge Bar */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] text-white max-w-[80%] truncate">
          {participant.isHost && <Crown className="w-2.5 h-2.5 text-yellow-400 shrink-0" />}
          <span className="truncate font-semibold">{participant.name}</span>
          {isLocal && <span className="text-gray-400 font-normal">(Tú)</span>}
        </div>

        <div className="p-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10">
          {participant.micActive ? (
            <Mic className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <MicOff className="w-2.5 h-2.5 text-red-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoGrid({
  localParticipant,
  remoteParticipants,
}: VideoGridProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const allParticipants = [localParticipant, ...remoteParticipants];

  // Render participants who have camera active OR are connected with mic/voice
  const inCallParticipants = allParticipants.filter(
    (p) => p.cameraActive || p.micActive || Boolean(p.stream)
  );

  if (inCallParticipants.length === 0) return null;

  return (
    <div className="w-full bg-[#07090E] border-b border-white/10 px-3 py-2 flex flex-col gap-1.5 shrink-0">
      <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">En llamada: {inCallParticipants.length}</span>
        </div>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-gray-400 hover:text-white text-[10px] underline cursor-pointer"
        >
          {isCollapsed ? "Mostrar cámaras" : "Ocultar cámaras"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="w-full flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
          {inCallParticipants.map((p, idx) => (
            <VideoTile key={p.id || idx} participant={p} isLocal={p.id === localParticipant.id} />
          ))}
        </div>
      )}
    </div>
  );
}
