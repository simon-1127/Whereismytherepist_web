/**
 * Provider payout KYC (bank account + PAN). The actual verification lives in
 * the Railway backend (POST /payments/payout-account): it creates the
 * RazorpayX contact + fund account and runs a penny drop. kyc_status and the
 * razorpay_* columns are trigger-protected, so the website never writes them.
 * Rules here mirror the backend's so the form can fail fast.
 */
export type KycStatus = "not_started" | "pending" | "verified" | "failed";

export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const ACCOUNT_RE = /^\d{6,20}$/;

export type KycInput = {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  pan_number: string;
};

/** Normalises the input and returns it, or the first problem found. */
export function checkKycInput(raw: Partial<Record<keyof KycInput, unknown>>): { input?: KycInput; error?: string } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const input: KycInput = {
    account_holder_name: str(raw.account_holder_name).replace(/\s+/g, " "),
    account_number: str(raw.account_number).replace(/\s+/g, ""),
    ifsc_code: str(raw.ifsc_code).toUpperCase(),
    pan_number: str(raw.pan_number).toUpperCase(),
  };
  if (!input.account_holder_name || input.account_holder_name.length > 120) return { error: "Enter the name exactly as it appears on your bank account." };
  if (!ACCOUNT_RE.test(input.account_number)) return { error: "That account number is not valid. Use digits only." };
  if (!IFSC_RE.test(input.ifsc_code)) return { error: "That IFSC code is not valid. It looks like SBIN0001234." };
  if (!PAN_RE.test(input.pan_number)) return { error: "That PAN is not valid. It looks like ABCDE1234F." };
  return { input };
}

export const KYC_COPY: Record<KycStatus, { label: string; tone: "ok" | "warn" | "error" | "muted"; text: string }> = {
  not_started: { label: "Not started", tone: "muted", text: "Add your bank account and PAN so we can pay you for your sessions." },
  pending: { label: "Verifying", tone: "warn", text: "We're verifying your bank account with a ₹1 test deposit. This usually takes a few hours." },
  verified: { label: "Verified", tone: "ok", text: "Your bank account is verified. Session earnings will be paid here." },
  failed: { label: "Failed", tone: "error", text: "We couldn't verify this bank account. Check the details and try again." },
};

export const kycStatus = (s: string | null | undefined): KycStatus => (s && s in KYC_COPY ? (s as KycStatus) : "not_started");
