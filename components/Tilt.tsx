"use client";

import { useEffect, useRef } from "react";

/**
 * tilt.js-style 3D tilt with a moving glare (vanilla-tilt). Loaded on the
 * client only, skipped for reduced-motion users and touch-only devices
 * (where it would fight scrolling).
 */
export default function Tilt({
  children,
  className = "",
  max = 9,
  glare = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current as (HTMLDivElement & { vanillaTilt?: { destroy: () => void } }) | null;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let cancelled = false;
    import("vanilla-tilt").then(({ default: VanillaTilt }) => {
      if (cancelled || !ref.current) return;
      VanillaTilt.init(ref.current, {
        max,
        speed: 500,
        scale: 1.03,
        perspective: 1100,
        glare: true,
        "max-glare": glare,
        gyroscope: false,
      });
    });
    return () => {
      cancelled = true;
      el.vanillaTilt?.destroy();
    };
  }, [max, glare]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}
