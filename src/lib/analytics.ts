"use client";

export type AnalyticsEvent =
  | "landing_view"
  | "create_room_click"
  | "how_it_works_click"
  | "features_view"
  | "room_joined"
  | "stream_switch"
  | "playback_sync_trigger"
  | "voice_toggle"
  | "invite_link_copied"
  | "chat_message_sent"
  | "language_switched";

interface EventPayload {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, payload: EventPayload = {}) {
  try {
    const timestamp = new Date().toISOString();
    const eventData = {
      event,
      timestamp,
      url: typeof window !== "undefined" ? window.location.href : "",
      ...payload,
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`[StreamSync] ${event}`, eventData);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("streamsync_event", {
          detail: eventData,
        })
      );

      const w = window as any;
      if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push(eventData);
      }
    }
  } catch {}
}
