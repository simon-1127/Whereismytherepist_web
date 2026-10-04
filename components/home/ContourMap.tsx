/**
 * Hand-drawn-looking topographic contours, generated deterministically on
 * the server (no client JS). The lines "draw" in once on load — that and
 * the pin dropping onto the map is the site's single orchestrated motion.
 */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function blob(cx: number, cy: number, r: number, wobble: number, seed: number, points = 9) {
  const rnd = rand(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 + (rnd() - 0.5) * wobble);
    pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr]);
  }
  // Closed Catmull-Rom → cubic Bézier
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

export default function ContourMap({ className = "" }: { className?: string }) {
  const rings = Array.from({ length: 9 }, (_, i) => blob(300 - i * 3, 300 + i * 2, 34 + i * 30, 0.16 + i * 0.012, 7 + i * 13));
  const side = Array.from({ length: 4 }, (_, i) => blob(540, 90, 20 + i * 22, 0.22, 101 + i * 7));
  return (
    <svg viewBox="0 0 600 600" fill="none" className={`contour ${className}`} aria-hidden>
      <defs>
        {/* The logo's gradient: teal → blue → violet → coral */}
        <linearGradient id="wmt-contour" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00b8bc" />
          <stop offset="0.38" stopColor="#0077c6" />
          <stop offset="0.7" stopColor="#522cad" />
          <stop offset="1" stopColor="#ff5266" />
        </linearGradient>
      </defs>
      {rings.map((d, i) => (
        <path key={i} pathLength={1} d={d} stroke="url(#wmt-contour)" strokeWidth={i === 0 ? 2.2 : 1.5} opacity={0.95 - i * 0.075} />
      ))}
      {side.map((d, i) => (
        <path key={`s${i}`} pathLength={1} d={d} stroke="url(#wmt-contour)" strokeWidth={1.3} opacity={0.55 - i * 0.1} />
      ))}
      <path className="route" d="M40,520 C140,470 180,410 300,300" stroke="#ff5266" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
    </svg>
  );
}
