"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals anything marked `data-reveal` (and each child of a
 * `data-reveal-group`, staggered) as it scrolls into view; things already on
 * screen animate in straight away on load.
 *
 * Uses the Web Animations API on purpose: it never adds or changes HTML
 * attributes/classes. The earlier version wrote `data-reveal` and inline
 * `style` onto elements, and when that happened before React finished
 * hydrating the page, React reported a hydration mismatch.
 * The hidden starting state comes from CSS (`.js [data-reveal]` in
 * globals.css); `fill: "forwards"` keeps the final visible state.
 */
const done = new WeakSet<Element>();

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-group]), [data-reveal-group] > *");

    const show = (el: HTMLElement) => {
      if (done.has(el)) return;
      done.add(el);
      const group = el.parentElement?.hasAttribute("data-reveal-group") ? el.parentElement : null;
      const index = group ? Array.prototype.indexOf.call(group.children, el) : 0;
      el.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(26px) scale(0.985)" },
              { opacity: 1, transform: "none" },
            ],
        {
          duration: reduced ? 1 : 750,
          delay: reduced ? 0 : Math.min(index, 8) * 80,
          easing: "cubic-bezier(.2,.7,.2,1)",
          fill: "forwards",
        }
      );
    };

    if (!("IntersectionObserver" in window)) {
      targets().forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const scan = () => targets().forEach((el) => !done.has(el) && io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
