"use client";

import { useState } from "react";
import Link from "next/link";

export default function VideoRoom({
  sessionId,
  roomUrl,
  isStub,
  otherPartyName,
}: {
  sessionId: string;
  roomUrl: string | null;
  isStub: boolean;
  otherPartyName: string;
}) {
  const [joined, setJoined] = useState(false);

  if (!roomUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-slate-300 mb-2">No call room has been created for this session yet.</p>
        <Link href={`/sessions/${sessionId}`} className="text-blue-400 font-semibold text-sm">
          ← Back to booking
        </Link>
      </div>
    );
  }

  // Once DAILY_API_KEY is configured server-side, roomUrl will be a real
  // https://<yourdomain>.daily.co/... url and isStub will be false — this
  // branch then just works with no further code changes.
  if (!isStub) {
    return (
      <iframe
        src={roomUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full rounded-2xl border-0"
      />
    );
  }

  // --- Stub mode: no Daily.co key configured yet ---
  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-6">
          <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-white text-lg font-bold mb-2">Video isn't live yet</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          The booking, payment, and scheduling pipeline for this call is fully working — this
          screen is just waiting on a Daily.co API key to go live. Everything else (who can join,
          when, and for how long) is already wired up.
        </p>
        <button
          onClick={() => setJoined(true)}
          className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors"
        >
          Preview stub call room →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
        <div className="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
          You
        </div>
        <div className="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
          {otherPartyName}
        </div>
      </div>
      <p className="text-slate-400 text-xs mb-6">Simulated preview — no real video/audio is being sent.</p>
      <Link
        href={`/sessions/${sessionId}`}
        className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors"
      >
        Leave call
      </Link>
    </div>
  );
}
