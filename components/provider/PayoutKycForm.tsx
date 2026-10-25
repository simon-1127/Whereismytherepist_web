"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkKycInput, KYC_COPY, type KycStatus } from "../../lib/kyc";

type Summary = {
  holder: string | null;
  last4: string | null;
  ifsc: string | null;
  submittedAt: string | null;
  failureReason: string | null;
};

const TONE = { ok: "alert-ok", warn: "alert-warn", error: "alert-error", muted: "well text-ink-2" } as const;

/** Bank account + PAN form for payout KYC. Posts to /api/provider/kyc. */
export default function PayoutKycForm({ status: initialStatus, summary }: { status: KycStatus; summary: Summary }) {
  const router = useRouter();
  const [status, setStatus] = useState<KycStatus>(initialStatus);
  const [editing, setEditing] = useState(initialStatus === "not_started" || initialStatus === "failed");
  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [accountConfirm, setAccountConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pan, setPan] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const copy = KYC_COPY[status];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const { input, error } = checkKycInput({ account_holder_name: holder, account_number: account, ifsc_code: ifsc, pan_number: pan });
    if (!input) return setErrorMsg(error!);
    if (input.account_number !== accountConfirm.replace(/\s+/g, "")) return setErrorMsg("The two account numbers don't match.");

    setBusy(true);
    try {
      const res = await fetch("/api/provider/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || "Bank verification failed. Please try again.");
        return;
      }
      setStatus(data.kyc_status);
      setEditing(false);
      setAccount("");
      setAccountConfirm("");
      router.refresh();
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className={`alert ${TONE[copy.tone]}`} role="status">
        <p className="font-semibold">Bank verification: {copy.label}</p>
        <p className="mt-1">{copy.text}</p>
        {status === "failed" && summary.failureReason && <p className="mt-1">Reason: {summary.failureReason}</p>}
      </div>

      {!editing && (summary.last4 || summary.ifsc) && (
        <dl className="grid grid-cols-2 gap-4">
          <div className="well p-4">
            <dt className="text-sm text-ink-3">Account</dt>
            <dd className="mt-1 font-display text-lg font-semibold">
              {summary.last4 ? `•••• ${summary.last4}` : "—"}
            </dd>
            {summary.holder && <dd className="text-sm text-ink-2">{summary.holder}</dd>}
          </div>
          <div className="well p-4">
            <dt className="text-sm text-ink-3">IFSC</dt>
            <dd className="mt-1 font-display text-lg font-semibold">{summary.ifsc || "—"}</dd>
            {summary.submittedAt && (
              <dd className="text-sm text-ink-2">Submitted {new Date(summary.submittedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</dd>
            )}
          </div>
        </dl>
      )}

      {!editing ? (
        <button type="button" onClick={() => setEditing(true)} className="btn btn-quiet w-full">
          Use a different bank account
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorMsg && <p role="alert" className="alert alert-error">{errorMsg}</p>}
          <div>
            <label htmlFor="kyc-holder" className="field-label">Account holder name</label>
            <input id="kyc-holder" value={holder} onChange={(e) => setHolder(e.target.value)} required maxLength={120}
              autoComplete="name" className="field" />
            <p className="field-hint">Exactly as it appears on your bank account.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kyc-account" className="field-label">Account number</label>
              <input id="kyc-account" value={account} onChange={(e) => setAccount(e.target.value)} required
                inputMode="numeric" autoComplete="off" className="field" />
            </div>
            <div>
              <label htmlFor="kyc-account-confirm" className="field-label">Confirm account number</label>
              <input id="kyc-account-confirm" value={accountConfirm} onChange={(e) => setAccountConfirm(e.target.value)} required
                inputMode="numeric" autoComplete="off" onPaste={(e) => e.preventDefault()} className="field" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kyc-ifsc" className="field-label">IFSC code</label>
              <input id="kyc-ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} required maxLength={11}
                placeholder="SBIN0001234" autoComplete="off" className="field uppercase" />
            </div>
            <div>
              <label htmlFor="kyc-pan" className="field-label">PAN</label>
              <input id="kyc-pan" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} required maxLength={10}
                placeholder="ABCDE1234F" autoComplete="off" className="field uppercase" />
            </div>
          </div>
          <p className="field-hint">
            We send ₹1 to this account to confirm it&rsquo;s yours. Your details go straight to our payments partner, Razorpay.
          </p>
          <div className="flex gap-3">
            {(status === "pending" || status === "verified") && (
              <button type="button" onClick={() => setEditing(false)} disabled={busy} className="btn btn-quiet flex-1">Cancel</button>
            )}
            <button type="submit" disabled={busy} className="btn btn-primary flex-1">
              {busy ? "Verifying…" : "Verify bank account"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
