"use client";

/** Daily prebuilt call in an iframe. Rooms are private: the token is required. */
export default function VideoRoom({ roomUrl, meetingToken }: { roomUrl: string; meetingToken: string }) {
  const src = `${roomUrl}?t=${encodeURIComponent(meetingToken)}`;
  return (
    <iframe
      title="Video session"
      src={src}
      allow="camera; microphone; fullscreen; display-capture; autoplay; speaker-selection"
      className="h-full w-full rounded-[var(--radius-card)] border-0 bg-black"
    />
  );
}
