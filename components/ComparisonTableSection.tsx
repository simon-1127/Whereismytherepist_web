type Cell = { value: string; kind: "check" | "dash" | "note" | "highlight" };

const check: Cell = { value: "✓", kind: "check" };
const dash: Cell = { value: "—", kind: "dash" };
const note = (value: string): Cell => ({ value, kind: "note" });
const highlight = (value: string): Cell => ({ value, kind: "highlight" });

const COMPETITORS = [
  { name: "Wysa", tag: "AI-first" },
  { name: "Amaha", tag: "Clinical" },
  { name: "YourDOST", tag: "Counselling" },
  { name: "BetterLYF", tag: "Therapy" },
  { name: "Calm / Headspace", tag: "Wellness" },
];

const US = { name: "Where's My Therapist", tag: "All-in-one" };

const ROWS: { feature: string; cells: Cell[]; us: Cell }[] = [
  { feature: "AI companion (24/7)", cells: [check, dash, dash, dash, dash], us: check },
  { feature: "Live video therapy", cells: [dash, check, check, check, dash], us: check },
  { feature: "Psychiatrist access", cells: [dash, check, dash, dash, dash], us: check },
  { feature: "Full Indian-language UI", cells: [dash, dash, note("Partial"), dash, dash], us: highlight("✓ 10 langs") },
  { feature: "Native UPI / GPay payments", cells: [dash, dash, dash, dash, dash], us: check },
  { feature: "Group / family therapy", cells: [dash, dash, dash, dash, dash], us: check },
  { feature: "Medication tracker", cells: [dash, dash, dash, dash, dash], us: check },
  { feature: "Moderated peer community", cells: [dash, dash, dash, dash, dash], us: check },
  { feature: "Progress reports to provider", cells: [dash, check, dash, dash, dash], us: check },
  { feature: "Offline mode (low connectivity)", cells: [dash, dash, dash, dash, check], us: check },
  { feature: "Insurance / EAP billing", cells: [check, dash, note("Partner-only"), dash, check], us: check },
];

const PRICE_ROW = {
  feature: "Starting price",
  cells: ["₹525/mo", "₹1,500/session", "₹500/session", "₹800/session", "₹290/mo"],
  us: "3 weeks free, then ₹299/mo",
};

function CellValue({ cell, us }: { cell: Cell; us?: boolean }) {
  if (cell.kind === "check")
    return (
      <svg className={`mx-auto h-5 w-5 ${us ? "text-white" : "text-teal"}`} fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24" aria-label="Yes">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  if (cell.kind === "dash") return <span className="text-ink-3/50" aria-label="No">—</span>;
  if (cell.kind === "highlight") return <span className="whitespace-nowrap text-sm font-semibold">{cell.value.replace("✓ ", "")}</span>;
  return <span className="text-sm text-ink-3">{cell.value}</span>;
}

export default function ComparisonTableSection() {
  return (
    <div className="shell">
      <div data-reveal className="max-w-2xl">
        <h2 className="text-4xl font-bold md:text-5xl">How the app compares</h2>
        <p className="mt-4 text-lg text-white/70">
          Each row was checked against the current version of each app. Where we don&rsquo;t know, we say so.
        </p>
      </div>

      <div data-reveal className="mt-10 overflow-x-auto text-ink shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] sheet">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="w-[240px] px-6 py-5 text-sm font-semibold text-ink-3">Feature</th>
              {COMPETITORS.map((c) => (
                <th key={c.name} scope="col" className="px-3 py-5 text-center">
                  <span className="block font-display text-[15px] font-semibold">{c.name}</span>
                  <span className="block text-xs font-normal text-ink-3">{c.tag}</span>
                </th>
              ))}
              <th scope="col" className="bg-brand-violet px-4 py-5 text-center text-white">
                <span className="block font-display text-[15px] font-semibold">Where&rsquo;s My Therapist</span>
                <span className="block text-xs font-normal text-white/60">{US.tag}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature} className="border-t border-line">
                <th scope="row" className="px-6 py-3.5 text-[15px] font-medium">{row.feature}</th>
                {row.cells.map((cell, j) => (
                  <td key={j} className="px-3 py-3.5 text-center"><CellValue cell={cell} /></td>
                ))}
                <td className="bg-brand-violet px-4 py-3.5 text-center text-white"><CellValue cell={row.us} us /></td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <th scope="row" className="px-6 py-4 text-[15px] font-semibold">{PRICE_ROW.feature}</th>
              {PRICE_ROW.cells.map((p, j) => (
                <td key={j} className="px-3 py-4 text-center text-sm text-ink-2">{p}</td>
              ))}
              <td className="bg-brand-violet px-4 py-4 text-center font-display font-semibold text-white">{PRICE_ROW.us}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
