import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { canJoinSession, createDailyMeetingToken, getOrCreateSessionRoom, joinWindow } from "../../../../lib/daily";
import VideoRoom from "../../../../components/VideoRoom";

export const dynamic = "force-dynamic";
export const metadata = { title: "Video session" };

export default async function CallRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/sessions/${id}/room`);

  const { data: session } = await supabase
    .from("sessions")
    .select("id, client_id, provider_id, status, scheduled_start, scheduled_end, daily_room_name, daily_room_url, daily_room_exp")
    .eq("id", id)
    .maybeSingle();
  if (!session) notFound();

  const isClient = session.client_id === user.id;
  const isProvider = session.provider_id === user.id;
  if (!isClient && !isProvider) notFound();

  if (!canJoinSession(session)) {
    return <CallMessage sessionId={id} title="This call isn't open right now" body="Calls open 10 minutes before the start time and close 15 minutes after the end." />;
  }

  const [{ data: providerProfile }, { data: clientProfile }] = await Promise.all([
    supabase.from("provider_profiles").select("full_name").eq("user_id", session.provider_id).maybeSingle(),
    supabase.from("client_profiles").select("full_name").eq("user_id", session.client_id).maybeSingle(),
  ]);
  const ownName = (isProvider ? providerProfile?.full_name : clientProfile?.full_name) || (isProvider ? "Therapist" : "Client");
  const otherName = (isProvider ? clientProfile?.full_name : providerProfile?.full_name) || (isProvider ? "your client" : "your therapist");

  let roomUrl: string;
  let token: string;
  try {
    const room = await getOrCreateSessionRoom(createAdminClient(), session);
    const { closesAt } = joinWindow(session.scheduled_start, session.scheduled_end);
    token = await createDailyMeetingToken({
      roomName: room.name,
      userName: ownName,
      isOwner: isProvider,
      exp: Math.floor(closesAt / 1000),
    });
    roomUrl = room.url;
  } catch (err: any) {
    console.error("Daily room error:", err);
    return <CallMessage sessionId={id} title="We couldn't open the video room" body="Please refresh in a moment. If it keeps happening, contact support with your session reference." retry />;
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col bg-brand">
      <div className="flex items-center justify-between px-4 py-3 text-white md:px-6">
        <p className="font-display text-lg font-semibold">Session with {otherName}</p>
        <Link href={`/sessions/${id}`} className="rounded-full px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          Leave
        </Link>
      </div>
      <div className="flex-1 px-2 pb-2 md:px-4 md:pb-4">
        <VideoRoom roomUrl={roomUrl} meetingToken={token} />
      </div>
    </main>
  );
}

function CallMessage({ sessionId, title, body, retry }: { sessionId: string; title: string; body: string; retry?: boolean }) {
  return (
    <main className="shell flex flex-1 items-center justify-center py-20">
      <div className="sheet max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-ink-2">{body}</p>
        <div className="mt-6 flex justify-center gap-3">
          {retry && <a href={`/sessions/${sessionId}/room`} className="btn btn-primary">Try again</a>}
          <Link href={`/sessions/${sessionId}`} className="btn btn-quiet">Back to session</Link>
        </div>
      </div>
    </main>
  );
}
