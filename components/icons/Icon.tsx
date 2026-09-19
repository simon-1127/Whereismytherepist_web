import { ReactNode } from "react";

type IconName =
  | "users"
  | "beaker"
  | "sparkles"
  | "shield-check"
  | "target"
  | "bolt"
  | "globe"
  | "trending-up"
  | "book-open"
  | "heart"
  | "plus-circle"
  | "moon"
  | "computer"
  | "clock"
  | "rupee";

const PATHS: Record<IconName, ReactNode> = {
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.09 9.09 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.94 11.94 0 0112 21c-2.17 0-4.207-.576-5.963-1.584a6.06 6.06 0 01-.037-.667m12-3.198a5.97 5.97 0 00-.94-3.198m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.99 8.99 0 003.74.477m.941-3.197a5.97 5.97 0 00-.941 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  ),
  beaker: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c.251-.023.501-.05.75-.082m0 0a24.3 24.3 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3m-5.55-12.196c.25.023.5.05.75.082M19.8 15.3l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.3 48.3 0 0112 20.25c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5m14.8.8-1.57.393a9.06 9.06 0 01-4.997.043"
    />
  ),
  sparkles: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  ),
  "shield-check": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75l2.25 2.25L15 9.75m-3-7.036A11.96 11.96 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </>
  ),
  bolt: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
    />
  ),
  globe: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9 9 0 008.716-6.747M12 21a9 9 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a9 9 0 017.843 4.582M12 3a9 9 0 00-7.843 4.582m15.686 0A11.95 11.95 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.96 8.96 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.92 17.92 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A8.96 8.96 0 013 12c0-.778.099-1.533.284-2.253"
    />
  ),
  "trending-up": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941"
    />
  ),
  "book-open": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.042A8.97 8.97 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.99 8.99 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.97 8.97 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.99 8.99 0 0018 18a8.97 8.97 0 00-6 2.292m0-14.25v14.25"
    />
  ),
  heart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  ),
  "plus-circle": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  moon: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  ),
  computer: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
    />
  ),
  clock: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  rupee: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 4h10M7 8h10M7 4c3.5 0 6 1.5 6 4s-2.5 4-6 4h-.5L15 19"
    />
  ),
};

export default function Icon({ name, className = "w-6 h-6" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      {PATHS[name]}
    </svg>
  );
}
