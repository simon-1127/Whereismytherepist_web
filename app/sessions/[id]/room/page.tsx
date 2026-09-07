import { createClient } from "../../../../lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import VideoRoom from "../../../../components/VideoRoom";

export const revalidate = 0;

export default async function CallRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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

  const scheduledStart = new Date(session.scheduled_start);
  const scheduledEnd = new Date(session.scheduled_end);
  const now = new Date();

  const canJoin =
    session.status === "confirmed" &&
    now.getTime() >= scheduledStart.getTime() - 10 * 60 * 1000 &&
    now.getTime() <= scheduledEnd.getTime();

  if (!canJoin) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-center px-6">
        <div>
          <p className="text-white font-semibold mb-3">This call isn't available right now.</p>
          <Link href={`/sessions/${session.id}`} className="text-blue-400 text-sm font-semibold">
            ← Back to booking details
          </Link>
        </div>
      </div>
    );
  }

  let otherPartyName = "the other participant";
  if (isClient) {
    const { data: providerProfile } = await supabase
      .from("provider_profiles")
      .select("full_name")
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

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-white font-semibold">Session with {otherPartyName}</span>
        <Link href={`/sessions/${session.id}`} className="text-slate-400 text-sm hover:text-white">
          Exit
        </Link>
      </div>
      <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden">
        <VideoRoom
          sessionId={session.id}
          roomUrl={session.daily_room_url}
          isStub={typeof session.daily_room_url === "string" && session.daily_room_url.startsWith("stub://")}
          otherPartyName={otherPartyName}
        />
      </div>
    </div>
  );
}
