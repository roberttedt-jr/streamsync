export interface OutgoingSignal {
  type: "join" | "offer" | "answer" | "candidate" | "leave";
  targetConnectionId: string;
  payload: any;
}

export interface IncomingSignal {
  id?: string;
  senderConnectionId: string;
  targetConnectionId: string;
  type: "join" | "offer" | "answer" | "candidate" | "leave";
  payload: any;
}

export interface WebRTCManagerOptions {
  connectionId: string;
  onRemoteStream: (remoteConnectionId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (remoteConnectionId: string) => void;
  sendSignal: (signal: OutgoingSignal) => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export class WebRTCManager {
  private myConnectionId: string;
  private localStream: MediaStream | null = null;
  private knownPeers = new Set<string>();
  private peerConnections = new Map<string, RTCPeerConnection>();
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  private makingOffer = new Map<string, boolean>();
  private isSettingRemoteAnswerPending = new Map<string, boolean>();
  private onRemoteStream: (remoteConnectionId: string, stream: MediaStream) => void;
  private onRemoteStreamRemoved: (remoteConnectionId: string) => void;
  private sendSignal: (signal: OutgoingSignal) => void;
  private isDestroyed = false;

  constructor(options: WebRTCManagerOptions) {
    this.myConnectionId = options.connectionId;
    this.onRemoteStream = options.onRemoteStream;
    this.onRemoteStreamRemoved = options.onRemoteStreamRemoved;
    this.sendSignal = options.sendSignal;
  }

  public syncPeers(activePeerConnectionIds: string[]) {
    if (this.isDestroyed) return;
    this.knownPeers = new Set(activePeerConnectionIds.filter((id) => id !== this.myConnectionId));

    // Close peers that are no longer in the room
    for (const remoteId of Array.from(this.peerConnections.keys())) {
      if (!this.knownPeers.has(remoteId)) {
        this.closePeer(remoteId);
      }
    }

    // Connect to known peers if we have a local stream
    if (this.localStream) {
      for (const remoteId of this.knownPeers) {
        if (!this.peerConnections.has(remoteId)) {
          this.initiateCallWith(remoteId);
        }
      }
    }
  }

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;

    // Connect to any known peers if media is newly added
    if (stream) {
      for (const remoteId of this.knownPeers) {
        if (!this.peerConnections.has(remoteId)) {
          this.initiateCallWith(remoteId);
        }
      }
    }

    // Update tracks on all existing peer connections
    for (const [remoteId, pc] of this.peerConnections.entries()) {
      const senders = pc.getSenders();

      if (stream) {
        // Add or replace audio track
        const audioTrack = stream.getAudioTracks()[0];
        const audioSender = senders.find((s) => s.track?.kind === "audio");
        if (audioSender) {
          audioSender.replaceTrack(audioTrack || null).catch(() => {});
        } else if (audioTrack) {
          pc.addTrack(audioTrack, stream);
        }

        // Add or replace video track
        const videoTrack = stream.getVideoTracks()[0];
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(videoTrack || null).catch(() => {});
        } else if (videoTrack) {
          pc.addTrack(videoTrack, stream);
        }
      } else {
        // Remove tracks if stream was removed
        senders.forEach((sender) => {
          try {
            pc.removeTrack(sender);
          } catch {}
        });
      }
    }
  }

  public initiateCallWith(remoteConnectionId: string) {
    if (this.isDestroyed || remoteConnectionId === this.myConnectionId) return;
    const pc = this.getOrCreatePeerConnection(remoteConnectionId);

    // If we have local stream, announce our readiness
    this.sendSignal({
      type: "join",
      targetConnectionId: remoteConnectionId,
      payload: { hasAudio: Boolean(this.localStream?.getAudioTracks().length), hasVideo: Boolean(this.localStream?.getVideoTracks().length) },
    });
  }

  public async handleSignal(signal: IncomingSignal) {
    if (this.isDestroyed) return;
    const { senderConnectionId, type, payload } = signal;
    if (!senderConnectionId || senderConnectionId === this.myConnectionId) return;

    const pc = this.getOrCreatePeerConnection(senderConnectionId);
    const isPolite = this.myConnectionId < senderConnectionId;

    try {
      if (type === "join") {
        // Remote peer joined or requested call: if we are polite or have media, create offer
        if (this.localStream) {
          this.negotiate(senderConnectionId);
        }
      } else if (type === "offer") {
        const offerCollision =
          Boolean(this.makingOffer.get(senderConnectionId)) ||
          pc.signalingState !== "stable";

        if (offerCollision && !isPolite) {
          // Impolite peer ignores offer collision
          return;
        }

        this.isSettingRemoteAnswerPending.set(senderConnectionId, false);
        await pc.setRemoteDescription(new RTCSessionDescription(payload));

        // Process queued ICE candidates
        const queued = this.pendingCandidates.get(senderConnectionId) || [];
        this.pendingCandidates.set(senderConnectionId, []);
        for (const candidate of queued) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.sendSignal({
          type: "answer",
          targetConnectionId: senderConnectionId,
          payload: answer,
        });
      } else if (type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));

        // Process queued ICE candidates
        const queued = this.pendingCandidates.get(senderConnectionId) || [];
        this.pendingCandidates.set(senderConnectionId, []);
        for (const candidate of queued) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
      } else if (type === "candidate") {
        if (payload) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(payload)).catch(() => {});
          } else {
            const queued = this.pendingCandidates.get(senderConnectionId) || [];
            queued.push(payload);
            this.pendingCandidates.set(senderConnectionId, queued);
          }
        }
      } else if (type === "leave") {
        this.closePeer(senderConnectionId);
      }
    } catch (err) {
      console.warn("[WebRTC] Signal handle error with " + senderConnectionId + ":", err);
    }
  }

  private async negotiate(remoteConnectionId: string) {
    const pc = this.getOrCreatePeerConnection(remoteConnectionId);
    try {
      this.makingOffer.set(remoteConnectionId, true);
      const offer = await pc.createOffer();
      if (pc.signalingState !== "stable") return;
      await pc.setLocalDescription(offer);

      this.sendSignal({
        type: "offer",
        targetConnectionId: remoteConnectionId,
        payload: offer,
      });
    } catch (err) {
      console.warn("[WebRTC] Negotiation error with " + remoteConnectionId + ":", err);
    } finally {
      this.makingOffer.set(remoteConnectionId, false);
    }
  }

  private getOrCreatePeerConnection(remoteConnectionId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(remoteConnectionId);
    if (pc) return pc;

    pc = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS,
      iceCandidatePoolSize: 2,
    });

    // Add local tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc!.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: "candidate",
          targetConnectionId: remoteConnectionId,
          payload: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream(remoteConnectionId, event.streams[0]);
      }
    };

    pc.onnegotiationneeded = async () => {
      if (this.localStream) {
        await this.negotiate(remoteConnectionId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc!.iceConnectionState === "disconnected" || pc!.iceConnectionState === "failed" || pc!.iceConnectionState === "closed") {
        this.onRemoteStreamRemoved(remoteConnectionId);
      }
    };

    this.peerConnections.set(remoteConnectionId, pc);
    return pc;
  }

  public closePeer(remoteConnectionId: string) {
    const pc = this.peerConnections.get(remoteConnectionId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(remoteConnectionId);
    }
    this.pendingCandidates.delete(remoteConnectionId);
    this.makingOffer.delete(remoteConnectionId);
    this.onRemoteStreamRemoved(remoteConnectionId);
  }

  public destroy() {
    this.isDestroyed = true;
    for (const [remoteId, pc] of this.peerConnections.entries()) {
      try {
        pc.close();
      } catch {}
    }
    this.peerConnections.clear();
    this.pendingCandidates.clear();
    this.makingOffer.clear();
    this.localStream = null;
  }
}
