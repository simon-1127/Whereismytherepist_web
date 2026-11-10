"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { DAY_LABELS, istToday, rpcMessage, type GenDocSchedule } from "../../lib/gendoc";

const MINUTE_CHOICES = [5, 10, 15, 20, 30, 45, 60];

/** "09:00:00" → "09:00" for <input type="time"> and back. */
const toInput = (t: string | null) => (t ? t.slice(0, 5) : "");
const toPg = (t: string) => `${t}:00`;
const mins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/**
 * gendoc_schedules + the two profile settings the app's Hours screen owns
 * (consultation_minutes, is_accepting_queue), then fn_recompute_gendoc_queue
 * for today, because both change everyone's estimate. Same order and
 * validation as the app.
 *
 * working_days: ISO numbering, 1 = Monday … 7 = Sunday — exactly what the
 * app writes, so the two stay interchangeable.
 */
export default function GenDocHoursForm({
  userId,
  initialSchedule,
  initialMinutes,
  initialAccepting,
}: {
  userId: string;
  initialSchedule: GenDocSchedule;
  initialMinutes: number;
  initialAccepting: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [dayStart, setDayStart] = useState(toInput(initialSchedule.day_start));
  const [dayEnd, setDayEnd] = useState(toInput(initialSchedule.day_end));
  const [hasLunch, setHasLunch] = useState(!!(initialSchedule.lunch_start && initialSchedule.lunch_end));
  const [lunchStart, setLunchStart] = useState(toInput(initialSchedule.lunch_start) || "13:00");
  const [lunchEnd, setLunchEnd] = useState(toInput(initialSchedule.lunch_end) || "14:00");
  const [days, setDays] = useState(new Set(initialSchedule.working_days));
  const [minutes, setMinutes] = useState(initialMinutes);
  const [accepting, setAccepting] = useState(initialAccepting);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const capacity = useMemo(() => {
    if (!dayStart || !dayEnd) return 0;
    let working = mins(dayEnd) - mins(dayStart);
    if (hasLunch && lunchStart && lunchEnd) working -= mins(lunchEnd) - mins(lunchStart);
    return working > 0 && minutes > 0 ? Math.floor(working / minutes) : 0;
  }, [dayStart, dayEnd, hasLunch, lunchStart, lunchEnd, minutes]);

  function validate() {
    if (!dayStart || !dayEnd) return "Set when your day starts and ends.";
    if (mins(dayEnd) <= mins(dayStart)) return "Your day has to end after it starts.";
    if (hasLunch) {
      if (!lunchStart || !lunchEnd) return "Set both a lunch start and end, or turn the break off.";
      if (mins(lunchEnd) <= mins(lunchStart)) return "Lunch has to end after it starts.";
      if (mins(lunchStart) < mins(dayStart) || mins(lunchEnd) > mins(dayEnd)) return "Your lunch break needs to sit inside your working hours.";
    }
    if (!days.size) return "Pick at least one working day.";
    if (!(minutes >= 5 && minutes <= 120)) return "A consult has to be between 5 and 120 minutes.";
    return null;
  }

  function toggleDay(d: number) {
    const next = new Set(days);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setDays(next);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    try {
      const { error: sErr } = await supabase.from("gendoc_schedules").upsert({
        gendoc_id: userId,
        day_start: toPg(dayStart),
        day_end: toPg(dayEnd),
        lunch_start: hasLunch ? toPg(lunchStart) : null,
        lunch_end: hasLunch ? toPg(lunchEnd) : null,
        working_days: [...days].sort((a, b) => a - b),
      });
      if (sErr) throw sErr;
      const { error: pErr } = await supabase
        .from("gendoc_profiles")
        .update({ consultation_minutes: minutes, is_accepting_queue: accepting })
        .eq("user_id", userId);
      if (pErr) throw pErr;
      const { error: rErr } = await supabase.rpc("fn_recompute_gendoc_queue", { p_gendoc_id: userId, p_date: istToday() });
      if (rErr) throw rErr;
      setOk("Hours saved. Waiting times are updated.");
      router.refresh();
    } catch (err: any) {
      setError(`Couldn't save your hours: ${rpcMessage(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-10">
      {error && <p role="alert" className="alert alert-error">{error}</p>}
      {ok && !error && <p role="status" className="alert alert-ok">{ok}</p>}

      <section className="flex items-start justify-between gap-6 rounded-[var(--radius-inner)] bg-mist p-5">
        <div>
          <p className="font-display text-lg font-semibold">Taking new patients today</p>
          <p className="mt-1 text-[15px] text-ink-2">
            Turn this off to stop new people joining. Anyone already waiting stays in line.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={accepting}
          aria-label="Taking new patients today"
          onClick={() => setAccepting(!accepting)}
          className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition-colors ${accepting ? "bg-teal" : "bg-ink-3/40"}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left] ${accepting ? "left-7" : "left-1"}`} />
        </button>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-ink">Working days</h3>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, i) => {
            const d = i + 1; // 1 = Monday, matching working_days
            const on = days.has(d);
            return (
              <button
                type="button"
                key={label}
                onClick={() => toggleDay(d)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  on ? "border-ink bg-brand text-white" : "border-transparent bg-mist text-ink-2 hover:bg-mist-2"
                }`}
              >
                {on && <span className="mr-1.5">✓</span>}
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="day-start" className="field-label">Day starts</label>
          <input id="day-start" type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value)} required className="field" />
        </div>
        <div>
          <label htmlFor="day-end" className="field-label">Day ends</label>
          <input id="day-end" type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} required className="field" />
        </div>
      </section>

      <section>
        <label className="flex items-center gap-3 text-[15px] font-semibold">
          <input type="checkbox" checked={hasLunch} onChange={(e) => setHasLunch(e.target.checked)} className="h-5 w-5 accent-brand-violet" />
          Lunch break
        </label>
        {hasLunch && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lunch-start" className="field-label">Lunch starts</label>
              <input id="lunch-start" type="time" value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="lunch-end" className="field-label">Lunch ends</label>
              <input id="lunch-end" type="time" value={lunchEnd} onChange={(e) => setLunchEnd(e.target.value)} className="field" />
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-1 text-lg font-semibold text-ink">Length of one consult</h3>
        <p className="field-hint mb-3 mt-0">Estimated times for people in your queue step by this.</p>
        <div className="flex flex-wrap gap-2">
          {MINUTE_CHOICES.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMinutes(m)}
              aria-pressed={minutes === m}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                minutes === m ? "border-ink bg-brand text-white" : "border-transparent bg-mist text-ink-2 hover:bg-mist-2"
              }`}
            >
              {m} min
            </button>
          ))}
          {!MINUTE_CHOICES.includes(minutes) && (
            <span className="rounded-full border border-ink bg-brand px-4 py-2 text-sm font-semibold text-white">{minutes} min</span>
          )}
        </div>
        <p className="mt-4 text-sm text-ink-3">
          {capacity > 0 ? `That's room for about ${capacity} consults a day.` : "Set your hours to see how many consults fit in a day."}
        </p>
      </section>

      <button type="submit" disabled={saving} className="btn btn-primary w-full">
        {saving ? "Saving…" : "Save hours"}
      </button>
    </form>
  );
}
