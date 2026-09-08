import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "../../../lib/money";

export const revalidate = 0;

export default async function ProviderBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="max-w-lg mx-auto text-center py-24">
          <p className="text-slate-600 mb-4">Please sign in to view your bookings.</p>
          <Link href="/login" className="text-blue-700 font-semibold">Sign in →</Link>
        </div>
      </div>
    );
  }

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userRow?.role !== "provider") {
    redirect("/");
  }

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, client_id, status, scheduled_start, amount, currency, provider_payout_amount")
    .eq("provider_id", user.id)
    .order("scheduled_start", { ascending: false });

  const clientIds = Array.from(new Set((sessions || []).map((s) => s.client_id)));
  const { data: clients } = clientIds.length
    ? await supabase.from("client_profiles").select("user_id, full_name").in("user_id", clientIds)
    : { data: [] as any[] };

  const clientNameById = new Map((clients || []).map((c) => [c.user_id, c.full_name]));

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <h1 className="text-3xl font-extrabold text-[#1E1B4B] mb-8">My Bookings</h1>

        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200">
            <p className="font-semibold text-lg text-slate-700">No bookings yet</p>
            <p className="text-sm mt-2">Set your availability so clients can book sessions with you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="block bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#1E1B4B]">{clientNameById.get(s.client_id) || "Client"}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(s.scheduled_start).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 block mb-1">
                      {s.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      Payout: {formatMoney(s.provider_payout_amount, s.currency)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
