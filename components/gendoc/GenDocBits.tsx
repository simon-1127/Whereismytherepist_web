import Link from "next/link";
import {
  AVAILABILITY_DOT,
  DEFAULT_SCHEDULE,
  fmtPgTime,
  workingDaysLabel,
  type Availability,
  type GenDocProfile,
} from "../../lib/gendoc";

const STATUS_COPY: Partial<Record<GenDocProfile["application_status"], { tone: string; text: string }>> = {
  draft: { tone: "alert-warn", text: "Your profile isn't live yet. Fill it in so your organisation can approve it." },
  submitted: { tone: "alert-warn", text: "Your profile is with your organisation for review. Employees can't join your queue until it's approved." },
  under_review: { tone: "alert-warn", text: "Your profile is being reviewed. Employees can't join your queue until it's approved." },
  rejected: { tone: "alert-error", text: "Your profile needs changes before it can go live." },
  suspended: { tone: "alert-error", text: "Your profile is paused. Contact your HR team." },
};

/** Approval state for the doctor (nothing shown once approved). */
export function StatusBanner({ profile, withLink = true }: { profile: GenDocProfile; withLink?: boolean }) {
  const c = STATUS_COPY[profile.application_status];
  if (!c) return null;
  return (
    <div className={`alert ${c.tone}`}>
      <p>
        {c.text}
        {withLink && (profile.application_status === "draft" || profile.application_status === "rejected") && (
          <>
            {" "}
            <Link href="/gendoc/profile" className="font-semibold underline">Edit profile</Link>
          </>
        )}
      </p>
      {profile.application_status === "rejected" && profile.rejection_reason && (
        <p className="mt-1">
          <span className="font-semibold">Reason:</span> {profile.rejection_reason}
        </p>
      )}
    </div>
  );
}

export function AvailabilityLine({ a, className = "" }: { a: Availability; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm text-ink-2 ${className}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${AVAILABILITY_DOT[a.kind]} ${a.kind === "open" ? "live-dot" : ""}`} />
      <span>
        <span className="font-semibold text-ink">{a.label}</span>
        {a.detail ? `. ${a.detail}` : ""}
      </span>
    </span>
  );
}

/** Working days, hours, lunch, consult length. */
export function HoursList({ profile }: { profile: GenDocProfile }) {
  const s = profile.schedule || DEFAULT_SCHEDULE;
  const rows: [string, string][] = [
    ["Days", workingDaysLabel(s.working_days)],
    ["Hours", `${fmtPgTime(s.day_start)} – ${fmtPgTime(s.day_end)} IST`],
    ...(s.lunch_start && s.lunch_end ? ([["Lunch break", `${fmtPgTime(s.lunch_start)} – ${fmtPgTime(s.lunch_end)}`]] as [string, string][]) : []),
    ["Each consult", `About ${profile.consultation_minutes || 30} min`],
  ];
  return (
    <dl className="divide-y divide-line">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-3 text-[15px]">
          <dt className="text-ink-3">{k}</dt>
          <dd className="text-right font-semibold text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Message page for the consult video rooms (closed, failed, etc.). */
export function ConsultMessage({
  title,
  body,
  backHref,
  backLabel,
  retryHref,
}: {
  title: string;
  body: string;
  backHref: string;
  backLabel: string;
  retryHref?: string;
}) {
  return (
    <main className="shell flex flex-1 items-center justify-center py-20">
      <div className="sheet max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-ink-2">{body}</p>
        <div className="mt-6 flex justify-center gap-3">
          {retryHref && <a href={retryHref} className="btn btn-primary">Try again</a>}
          <Link href={backHref} className="btn btn-quiet">{backLabel}</Link>
        </div>
      </div>
    </main>
  );
}
