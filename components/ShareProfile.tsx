"use client";

import { useEffect, useState } from "react";
import { androidIntentUrl, isAndroid } from "../lib/app-links";

/**
 * Share + "Open in the app" for a therapist's public profile.
 * Used on /therapists/[id] (anyone) and /provider/profile (the therapist
 * sharing their own page). The app's share sheet links to this same page.
 */
export default function ShareProfile({
  providerId,
  name,
  url,
  variant = "visitor",
}: {
  providerId: string;
  name: string;
  /** Absolute public URL of the profile. */
  url: string;
  variant?: "visitor" | "owner";
}) {
  const [copied, setCopied] = useState(false);
  const [android, setAndroid] = useState(false);
  useEffect(() => setAndroid(isAndroid(navigator.userAgent)), []);

  const text =
    variant === "owner"
      ? "Book a session with me on Where's My Therapist"
      : `${name} on Where's My Therapist`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text, url });
        return;
      }
    } catch {
      return; // dismissed
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className="btn btn-quiet btn-sm">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12l-4 4m4-4l4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
        </svg>
        {copied ? "Link copied" : variant === "owner" ? "Share your profile" : "Share"}
      </button>
      {android && variant === "visitor" && (
        <a href={androidIntentUrl(`app/therapists/${providerId}`, url)} className="btn btn-quiet btn-sm">
          Open in the app
        </a>
      )}
    </div>
  );
}
