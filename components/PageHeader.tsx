/**
 * Content-page header. Left-aligned on a contour field — the same
 * wayfinding motif as the home hero, quieter.
 * `highlight` is kept for call-site compatibility; it's joined into the
 * title rather than coloured differently.
 */
export default function PageHeader({
  title,
  highlight,
  description,
  aside,
}: {
  title: string;
  highlight?: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className="shell pt-8 md:pt-12">
      <div className="relative overflow-hidden sheet px-6 py-12 md:px-14 md:py-16">
        <Contours className="pointer-events-none absolute -right-24 -top-10 h-[130%] w-auto md:right-0" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl">
            <h1 className="text-[2.4rem] font-bold text-ink md:text-[3.6rem]">
              {title}
              {highlight ? ` ${highlight}` : ""}
            </h1>
            {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{description}</p>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

export function Contours({ className = "", mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 480 360" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="wmt-ph" x1="120" y1="0" x2="480" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00b8bc" />
          <stop offset="0.45" stopColor="#0077c6" />
          <stop offset="0.75" stopColor="#522cad" />
          <stop offset="1" stopColor="#ff5266" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse
          key={i}
          cx={330 - i * 4}
          cy={170 + i * 3}
          rx={48 + i * 34}
          ry={34 + i * 24}
          stroke={mono ? "currentColor" : "url(#wmt-ph)"}
          strokeWidth="1.4"
          opacity={0.5 - i * 0.05}
          transform={`rotate(${-14 + i * 3} 330 170)`}
        />
      ))}
    </svg>
  );
}
