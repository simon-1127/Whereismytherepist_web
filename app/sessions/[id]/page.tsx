import { createClient } from "../../../lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../../lib/money";

export const revalidate = 0;

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled_by_client: "bg-red-50 text-red-700 border-red-200",
  cancelled_by_provider: "bg-red-50 text-red-700 border-red-200",
  no_show_client: "bg-red-50 text-red-700 border-red-200",
  no_show_provider: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-600 border-slate-200",
  disputed: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Payment pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_client: "Cancelled",
  cancelled_by_provider: "Cancelled by provider",
  no_show_client: "You missed this session",
  no_show_provider: "Provider missed this session",
  refunded: "Refunded",
  disputed: "Disputed",
};

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="max-w-lg mx-auto text-center py-24">
          <p className="text-slate-600 mb-4">Please sign in to view this booking.</p>
          <Link href="/login" className="text-blue-700 font-semibold">Sign in →</Link>
        </div>
      </div>
    );
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !session) {
    notFound();
  }

  const isClient = session.client_id === user.id;
  const isProvider = session.provider_id === user.id;

  if (!isClient && !isProvider) {
    notFound();
  }

  // Look up the other party's display name.
  let otherPartyName = "the other participant";
  if (isClient) {
    const { data: providerProfile } = await supabase
      .from("provider_profiles")
      .select("full_name, professional_title")
      .eq("user_id", session.provider_id)
      .single();
    otherPartyName = providerProfile?.full_name || otherPartyName;
  } else {
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("full_name")
      .eq("user_id", session.client_id)
      .single();
    otherPartyName = clientProfile?.full_name || otherPartyName;
  }

  const scheduledStart = new Date(session.scheduled_start);
  const scheduledEnd = new Date(session.scheduled_end);
  const now = new Date();

  // Allow joining from 10 minutes before start until the scheduled end.
  const canJoin =
    session.status === "confirmed" &&
    now.getTime() >= scheduledStart.getTime() - 10 * 60 * 1000 &&
    now.getTime() <= scheduledEnd.getTime();

  const hasNotStartedYet = session.status === "confirmed" && now < scheduledStart;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">

      <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 w-full flex-grow">
        <Link href={isProvider ? "/provider/bookings" : "/sessions"} className="text-sm text-blue-700 font-semibold mb-6 inline-block">
          ← Back to bookings
        </Link>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                {isClient ? "Session with" : "Session with"}
              </p>
              <h1 className="text-2xl font-extrabold text-[#1E1B4B]">{otherPartyName}</h1>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${
                STATUS_STYLES[session.status] || "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {STATUS_LABELS[session.status] || session.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-500 mb-1">Date & time</p>
              <p className="font-semibold text-[#1E1B4B]">
                {scheduledStart.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </p>
              <p className="font-semibold text-[#1E1B4B]">
                {scheduledStart.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} –{" "}
                {scheduledEnd.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-500 mb-1">Amount</p>
              <p className="font-semibold text-[#1E1B4B]">
                {formatMoney(session.amount, session.currency)}
              </p>
            </div>
          </div>

          {session.status === "pending_payment" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-6">
              This booking hasn't been paid for yet. If you closed the payment window, the slot hold may expire — please book again.
            </div>
          )}

          {canJoin ? (
            <Link
              href={`/sessions/${session.id}/room`}
              className="w-full bg-gradient-to-r from-blue-700 to-pink-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Join video call
            </Link>
          ) : hasNotStartedYet ? (
            <div className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-xl font-semibold text-center">
              You'll be able to join 10 minutes before the session starts
            </div>
          ) : session.status === "completed" ? (
            <div className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-xl font-semibold text-center">
              This session has ended
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
