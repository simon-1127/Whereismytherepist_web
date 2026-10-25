import { formatMoney } from "../../lib/money";
import { fmtDayShort } from "../../lib/format";

export type SettlementRow = { status: string; provider_share_amount: number; payout_id: string | null };
export type PayoutRow = { id: string; amount: number; status: string; utr: string | null; created_at: string; processed_at: string | null };
export type AdjustmentRow = { amount: number };

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  initiated: { label: "Sending", cls: "bg-amber-soft text-amber" },
  processing: { label: "On the way", cls: "bg-amber-soft text-amber" },
  paid: { label: "Paid", cls: "bg-teal-soft text-teal" },
  failed: { label: "Failed", cls: "bg-rose-soft text-rose-deep" },
};

/**
 * Where the provider's money is. Shares are decided per session by the
 * backend (session_settlements) and paid out by its payout run, so this
 * only reads: held = session not yet delivered/reviewed, ready = waiting
 * for the next payout, in payout = sent to the bank, not yet confirmed.
 */
export default function EarningsPanel({
  settlements,
  payouts,
  adjustments,
}: {
  settlements: SettlementRow[];
  payouts: PayoutRow[];
  adjustments: AdjustmentRow[];
}) {
  const sum = (rows: SettlementRow[]) => rows.reduce((s, r) => s + Number(r.provider_share_amount), 0);
  const held = sum(settlements.filter((s) => s.status === "held"));
  const ready = sum(settlements.filter((s) => s.status === "releasable" && !s.payout_id));
  const inPayout = sum(settlements.filter((s) => s.status === "releasable" && s.payout_id));
  const deductions = adjustments.reduce((s, a) => s + Math.min(0, Number(a.amount)), 0);

  return (
    <section className="sheet mt-6 space-y-5 p-6 md:p-8" aria-labelledby="earnings-title">
      <div>
        <h2 id="earnings-title" className="font-display text-2xl font-semibold">Earnings</h2>
        <p className="mt-1 text-sm text-ink-3">
          Your share of each session is paid automatically to your verified bank account about two days after the session.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="well p-4">
          <dt className="text-sm text-ink-3">Ready for payout</dt>
          <dd className="mt-1 font-display text-lg font-semibold">{formatMoney(Math.max(0, ready + deductions), "INR")}</dd>
        </div>
        <div className="well p-4">
          <dt className="text-sm text-ink-3">On the way</dt>
          <dd className="mt-1 font-display text-lg font-semibold">{formatMoney(inPayout, "INR")}</dd>
        </div>
        <div className="well p-4">
          <dt className="text-sm text-ink-3">Upcoming / in review</dt>
          <dd className="mt-1 font-display text-lg font-semibold">{formatMoney(held, "INR")}</dd>
        </div>
      </dl>
      {deductions < 0 && (
        <p className="alert alert-warn">
          {formatMoney(-deductions, "INR")} will be deducted from your next payout for refunded sessions.
        </p>
      )}

      <div>
        <h3 className="mb-2 font-semibold">Recent payouts</h3>
        {payouts.length === 0 ? (
          <p className="text-sm text-ink-3">No payouts yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {payouts.map((p) => {
              const st = PAYOUT_STATUS[p.status] || { label: p.status, cls: "bg-mist text-ink-2" };
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-semibold">{formatMoney(Number(p.amount), "INR")}</p>
                    <p className="text-sm text-ink-3">
                      {fmtDayShort(p.processed_at || p.created_at)}
                      {p.utr ? ` · UTR ${p.utr}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
