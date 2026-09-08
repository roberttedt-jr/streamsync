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

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const hasVideoTrack =
    participant.cameraActive &&
    participant.stream &&
    participant.stream.getVideoTracks().length > 0 &&
    participant.stream.getVideoTracks()[0].enabled;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0A0D14] border transition-all duration-200 aspect-video flex items-center justify-center min-w-[160px] max-w-[280px] flex-1 shrink-0 ${
        participant.isSpeaking
          ? "border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40"
          : "border-white/10"
      }`}
    >
      {/* Video Element if camera is active */}
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent audio feedback
          className="w-full h-full object-cover"
        />
      ) : (
        /* Fallback Avatar */
        <div className="flex flex-col items-center justify-center p-3 text-center">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white border-2 shadow-md transition-all ${
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
              participant.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <span className="text-[11px] font-semibold text-gray-300 mt-2 truncate max-w-[120px]">
            {participant.name} {isLocal ? "(Tú)" : ""}
          </span>
        </div>
      )}

      {/* Overlay Badge Bar */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-white max-w-[80%] truncate">
          {participant.isHost && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
          <span className="truncate font-semibold">{participant.name}</span>
          {isLocal && <span className="text-gray-400 font-normal">(Tú)</span>}
        </div>

        <div className="p-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
          {participant.micActive ? (
            <Mic className="w-3 h-3 text-emerald-400" />
          ) : (
            <MicOff className="w-3 h-3 text-red-400" />
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
  const allParticipants = [localParticipant, ...remoteParticipants];

  // Only render participants who have camera active OR if there are video participants in the room
  const anyCameraActive = allParticipants.some((p) => p.cameraActive);

  if (!anyCameraActive) return null;

  return (
    <div className="w-full bg-[#07090E] border-b border-white/10 px-3 py-2.5 flex items-center gap-2.5 overflow-x-auto shrink-0 scrollbar-thin">
      {allParticipants.map((p, idx) => (
        <VideoTile key={p.id || idx} participant={p} isLocal={idx === 0} />
      ))}
    </div>
  );
}
