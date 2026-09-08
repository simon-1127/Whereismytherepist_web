/**
 * All monetary amounts in the database (provider_profiles.base_session_rate,
 * sessions.amount, sessions.platform_fee_amount, sessions.provider_payout_amount)
 * are stored in paise — the smallest currency unit — same as Razorpay's API
 * expects. That's actually convenient: it means amounts read from the DB can
 * be sent to Razorpay's order API directly with NO conversion.
 *
 * The only place conversion is needed is the UI boundary:
 *   - Displaying a paise amount to a human -> divide by 100.
 *   - Taking rupees typed into a form -> multiply by 100 before saving.
 */

export function paiseToRupees(paise: number | null | undefined): number {
  if (!paise) return 0;
  return paise / 100;
}

export function rupeesToPaise(rupees: number | string): number {
  const n = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (!n || isNaN(n)) return 0;
  return Math.round(n * 100);
}

/**
 * Formats a paise amount as a display string, e.g. 100000 -> "₹1,000".
 * Uses Indian digit grouping (lakhs/crores) for INR.
 */
export function formatMoney(paise: number | null | undefined, currency: string = "INR"): string {
  const rupees = paiseToRupees(paise);
  const symbol = currency === "INR" ? "₹" : "";
  const formatted = rupees.toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  });
  return `${symbol}${formatted}`;
}
