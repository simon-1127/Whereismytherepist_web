"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { fmtDayLong, fmtTime, istDayKey } from "../../lib/format";

type Slot = { id: string; start_time: string; end_time: string; status: "open" | "held" | "booked" | "blocked" };

const STATUS: Record<Slot["status"], { cls: string; label: string }> = {
  open: { cls: "bg-paper border border-line text-ink", label: "Open" },
  held: { cls: "bg-amber-soft text-amber", label: "Being booked" },
  booked: { cls: "bg-teal-soft text-teal", label: "Booked" },
  blocked: { cls: "bg-mist text-ink-3", label: "Blocked" },
};

const IST_OFFSET = "+05:30";
const dayKey = { format: (d: Date) => istDayKey(d) };
const dayLabel = { format: (d: Date) => fmtDayLong(d) };

function todayIST() {
  return dayKey.format(new Date());
}

function groupByDay(slots: Slot[]) {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    const k = dayKey.format(new Date(s.start_time));
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(s);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, list]) => ({ key: k, label: dayLabel.format(new Date(list[0].start_time)), slots: list.sort((a, b) => a.start_time.localeCompare(b.start_time)) }));
}

export default function AvailabilityManager({ providerId, initialSlots }: { providerId: string; initialSlots: Slot[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);

  const tomorrow = dayKey.format(new Date(Date.now() + 86_400_000));
  const [date, setDate] = useState(tomorrow);
  const [from, setFrom] = useState("10:00");
  const [until, setUntil] = useState("18:00");
  const [duration, setDuration] = useState("50");
  const [gap, setGap] = useState("10");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Built explicitly in IST (+05:30), so the slots are right even if the
  // therapist's computer clock is set to another timezone.
  const preview = useMemo(() => {
    const len = Number(duration) * 60_000;
    const step = len + Number(gap) * 60_000;
    const start = new Date(`${date}T${from}:00${IST_OFFSET}`).getTime();
    const end = new Date(`${date}T${until}:00${IST_OFFSET}`).getTime();
    const out: { start: Date; end: Date }[] = [];
    if (!isFinite(start) || !isFinite(end)) return out;
    for (let t = start; t + len <= end; t += step) out.push({ start: new Date(t), end: new Date(t + len) });
    return out;
  }, [date, from, until, duration, gap]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    if (!preview.length) return setError("That window is too short for one session of this length.");
    if (preview[0].start.getTime() < Date.now()) return setError("Pick a time that hasn't passed yet.");

    const clash = preview.some((p) =>
      slots.some((s) => new Date(s.start_time) < p.end && new Date(s.end_time) > p.start)
    );
    if (clash) return setError("Some of these times overlap slots you've already opened. Adjust the window and try again.");

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("availability_slots")
        .insert(preview.map((p) => ({ provider_id: providerId, start_time: p.start.toISOString(), end_time: p.end.toISOString(), status: "open" })))
        .select("id, start_time, end_time, status");
      if (error) throw new Error(error.message);
      setSlots((prev) => [...prev, ...((data as Slot[]) || [])]);
      setOk(`Opened ${preview.length} ${preview.length === 1 ? "slot" : "slots"} on ${dayLabel.format(preview[0].start)}.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Couldn't open those slots.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    setError("");
    const { error } = await supabase.from("availability_slots").delete().eq("id", id).eq("status", "open");
    if (error) setError(error.message);
    else setSlots((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  const days = groupByDay(slots);
  const openCount = slots.filter((s) => s.status === "open").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <form onSubmit={add} className="sheet space-y-5 p-6 lg:sticky lg:top-28">
        <h2 className="text-2xl font-semibold">Open new times</h2>
        <div>
          <label htmlFor="av-date" className="field-label">Day</label>
          <input id="av-date" type="date" value={date} min={todayIST()} onChange={(e) => setDate(e.target.value)} required className="field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="av-from" className="field-label">From</label>
            <input id="av-from" type="time" value={from} onChange={(e) => setFrom(e.target.value)} required className="field" />
          </div>
          <div>
            <label htmlFor="av-until" className="field-label">Until</label>
            <input id="av-until" type="time" value={until} onChange={(e) => setUntil(e.target.value)} required className="field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="av-len" className="field-label">Session length</label>
            <select id="av-len" value={duration} onChange={(e) => setDuration(e.target.value)} className="field">
              {[30, 45, 50, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="av-gap" className="field-label">Break between</label>
            <select id="av-gap" value={gap} onChange={(e) => setGap(e.target.value)} className="field">
              {[0, 5, 10, 15, 30].map((m) => <option key={m} value={m}>{m === 0 ? "None" : `${m} min`}</option>)}
            </select>
          </div>
        </div>

        <div className="well p-4">
          {preview.length ? (
            <>
              <p className="text-sm font-semibold">{preview.length} {preview.length === 1 ? "slot" : "slots"} will open</p>
              <p className="mt-1 text-sm text-ink-2">{preview.map((p) => fmtTime(p.start)).join(", ")}</p>
            </>
          ) : (
            <p className="text-sm text-ink-3">No slots fit in this window yet.</p>
          )}
        </div>

        {error && <p role="alert" className="alert alert-error">{error}</p>}
        {ok && <p role="status" className="alert alert-ok">{ok}</p>}

        <button type="submit" disabled={saving || !preview.length} className="btn btn-primary w-full">
          {saving ? "Opening…" : `Open ${preview.length || ""} ${preview.length === 1 ? "slot" : "slots"}`}
        </button>
      </form>

      <section aria-label="Your upcoming availability">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="chip">{openCount} open</span>
          <span className="chip bg-teal-soft text-teal">{bookedCount} booked</span>
        </div>
        {days.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border-2 border-dashed border-line px-6 py-14 text-center">
            <p className="font-display text-xl font-semibold">No times open yet</p>
            <p className="mx-auto mt-2 max-w-sm text-ink-3">Open a few slots on the left. Clients can book them straight away.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((d) => (
              <div key={d.key} className="card p-5">
                <h3 className="text-lg font-semibold">{d.label}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {d.slots.map((s) => (
                    <li key={s.id} className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-3.5 text-sm font-semibold ${STATUS[s.status].cls} ${s.status === "open" ? "pr-1.5" : "pr-3.5"}`}>
                      {fmtTime(s.start_time)}
                      {s.status === "open" ? (
                        <button
                          onClick={() => remove(s.id)}
                          disabled={deleting === s.id}
                          aria-label={`Remove ${fmtTime(s.start_time)} slot`}
                          className="grid h-6 w-6 place-items-center rounded-full text-ink-3 hover:bg-rose-soft hover:text-rose-deep"
                        >
                          {deleting === s.id ? "…" : "×"}
                        </button>
                      ) : (
                        <span className="font-normal opacity-80">{STATUS[s.status].label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
