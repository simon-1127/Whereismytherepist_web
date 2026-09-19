"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wrap any section/card in this to have it fade + slide up the first time
 * it scrolls into view. Pure CSS animation (see .reveal / .is-visible in
 * globals.css) driven by an IntersectionObserver — no layout thrash, no
 * animation library, and it respects prefers-reduced-motion automatically.
 *
 * <Reveal delay={120}><Card /></Reveal>
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
