import Link from "next/link";
import type { Display } from "../lib/sessions";
import { dateParts, fmtTimeRange, initials, minutesBetween } from "../lib/format";

export function Avatar({
  name,
  src,
  size = 48,
  className = "",
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  if (src) {
    return <img src={src} alt={name || ""} style={style} className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span
      style={style}
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-brand-soft font-display font-semibold text-brand-violet ${className}`}
    >
      {initials(name)}
    </span>
  );
}

const TONES: Record<Display["tone"], string> = {
  teal: "bg-teal-soft text-teal",
  rose: "bg-rose-soft text-rose-deep",
  amber: "bg-amber-soft text-amber",
  ink: "bg-brand text-white",
  muted: "bg-mist text-ink-3",
};

export function StatusPill({ display }: { display: Display }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${TONES[display.tone]}`}>
      {display.tone === "rose" && <span className="live-dot h-1.5 w-1.5 rounded-full bg-rose" />}
      {display.label}
    </span>
  );
}

/**
 * A booking, drawn as a ticket stub: the date block on the left, a tear
 * line, then who/when/status. Used on client + therapist session lists.
 */
export function SessionTicket({
  href,
  personName,
  personPhoto,
  subtitle,
  start,
  end,
  display,
  meta,
}: {
  href: string;
  personName: string;
  personPhoto?: string | null;
  subtitle?: string;
  start: string;
  end: string;
  display: Display;
  meta?: string;
}) {
  const d = dateParts(start);
  const upcoming = display.bucket === "upcoming";
  return (
    <Link href={href} className="card card-hover group flex items-center gap-4 p-3 pr-4 sm:gap-5 sm:p-4 sm:pr-6">
      <div
        className={`flex h-[88px] w-[76px] shrink-0 flex-col items-center justify-center rounded-[18px] sm:w-[88px] ${
          upcoming ? "bg-brand text-white" : "bg-mist text-ink"
        }`}
      >
        <span className={`text-xs font-semibold ${upcoming ? "text-white/75" : "text-ink-3"}`}>{d.weekday}</span>
        <span className="font-display text-[2.1rem] font-bold leading-none">{d.day}</span>
        <span className={`text-xs font-semibold ${upcoming ? "text-white/85" : "text-ink-2"}`}>{d.month}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar name={personName} src={personPhoto} size={40} className="hidden sm:grid" />
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink group-hover:text-brand-violet">{personName}</p>
            <p className="text-sm text-ink-3">
              {fmtTimeRange(start, end)} IST, {minutesBetween(start, end)} min{subtitle ? `. ${subtitle}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
          <StatusPill display={display} />
          {meta && <span className="text-[13px] text-ink-3">{meta}</span>}
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-dashed border-line px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-ink-3">{body}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}
