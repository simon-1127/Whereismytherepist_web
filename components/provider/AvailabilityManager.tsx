"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  status: "open" | "held" | "booked" | "blocked";
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  held: "bg-amber-50 text-amber-700 border-amber-200",
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  blocked: "bg-slate-100 text-slate-500 border-slate-200",
};

function groupByDay(slots: Slot[]) {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = new Date(slot.start_time).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(slot);
  }
  return Array.from(groups.entries())
    .map(([key, daySlots]) => ({
      key,
      date: new Date(daySlots[0].start_time),
      slots: daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default function AvailabilityManager({
  providerId,
  initialSlots,
}: {
  providerId: string;
  initialSlots: Slot[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [slots, setSlots] = useState<Slot[]>(initialSlots);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState("60");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dayGroups = groupByDay(slots);

  function buildSlotRanges(): { start: Date; end: Date }[] {
    const durationMinutes = parseInt(duration, 10);
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const dayStart = new Date(`${date}T00:00:00`);
    const rangeStart = new Date(dayStart);
    rangeStart.setHours(startH, startM, 0, 0);
    const rangeEnd = new Date(dayStart);
    rangeEnd.setHours(endH, endM, 0, 0);

    const ranges: { start: Date; end: Date }[] = [];
    let cursor = new Date(rangeStart);

    while (true) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000);
      if (slotEnd > rangeEnd) break;
      ranges.push({ start: new Date(cursor), end: slotEnd });
      cursor = slotEnd;
    }

    return ranges;
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const ranges = buildSlotRanges();

    if (ranges.length === 0) {
      setErrorMsg("That time window is too short for even one session of the selected length.");
      return;
    }

    if (ranges[0].start.getTime() < Date.now()) {
      setErrorMsg("Pick a date/time window in the future.");
      return;
    }

    setIsSaving(true);

    try {
      const rows = ranges.map((r) => ({
        provider_id: providerId,
        start_time: r.start.toISOString(),
        end_time: r.end.toISOString(),
        status: "open" as const,
      }));

      const { data: inserted, error } = await supabase.from("availability_slots").insert(rows).select();

      if (error) throw new Error(error.message);

      setSlots((prev) => [...prev, ...(inserted as Slot[])]);
      setSuccessMsg(`Added ${ranges.length} slot${ranges.length > 1 ? "s" : ""} on ${new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}.`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not create slots. Some may overlap with existing ones.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slotId: string) {
    setDeletingId(slotId);
    setErrorMsg("");
    try {
      const { error } = await supabase.from("availability_slots").delete().eq("id", slotId);
      if (error) throw new Error(error.message);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not remove that slot.");
    } finally {
      setDeletingId(null);
    }
  }

  const previewRanges = buildSlotRanges();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Add availability form */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-6">
          <h2 className="font-bold text-[#1E1B4B] mb-4">Add availability</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">From</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Until</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Session length</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            {previewRanges.length > 0 && (
              <p className="text-xs text-slate-500">
                This will create <strong>{previewRanges.length}</strong> slot{previewRanges.length > 1 ? "s" : ""}, from{" "}
                {previewRanges[0].start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} to{" "}
                {previewRanges[previewRanges.length - 1].end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.
              </p>
            )}

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs border border-emerald-100">{successMsg}</div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#1E1B4B] text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Adding…" : "Add slots"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing slots */}
      <div className="lg:col-span-3">
        <h2 className="font-bold text-[#1E1B4B] mb-4">Your upcoming availability</h2>
        {dayGroups.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="font-semibold text-slate-700">No upcoming availability yet</p>
            <p className="text-sm mt-1">Add some slots using the form to start getting booked.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dayGroups.map((group) => (
              <div key={group.key}>
                <p className="text-sm font-bold text-slate-700 mb-2">
                  {group.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`relative border rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 ${STATUS_STYLES[slot.status]}`}
                    >
                      <span>
                        {new Date(slot.start_time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </span>
                      {slot.status === "open" ? (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="text-current opacity-60 hover:opacity-100 transition-opacity"
                          title="Remove this slot"
                        >
                          {deletingId === slot.id ? "…" : "✕"}
                        </button>
                      ) : (
                        <span className="capitalize opacity-70">{slot.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
