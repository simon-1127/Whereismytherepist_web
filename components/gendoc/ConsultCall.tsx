import Link from "next/link";
import { callBackend } from "../../lib/backend";
import VideoRoom from "../VideoRoom";
import { ConsultMessage } from "./GenDocBits";

/**
 * GenDoc consult video. Like therapy sessions, the room + meeting token come
 * ONLY from the backend (`POST /gendoc/consults/:entryId/room`, user's JWT):
 * the token carries the user's id, and the backend checks the caller is one
 * of the two people on the queue entry and that the consult is open.
 */
export default async function ConsultCall({
  entryId,
  title,
  backHref,
  backLabel,
  retryHref,
  actions,
}: {
  entryId: string;
  title: string;
  backHref: string;
  backLabel: string;
  retryHref: string;
  actions?: React.ReactNode;
}) {
  const room = await callBackend(`/gendoc/consults/${entryId}/room`, { method: "POST", timeoutMs: 20_000 });
  if (room.error || !room.data?.url || !room.data?.token) {
    if (room.status === 403 || room.status === 400) {
      return <ConsultMessage title="This consult isn't open right now" body={room.error || "This consult is not active."} backHref={backHref} backLabel={backLabel} />;
    }
    return (
      <ConsultMessage
        title="We couldn't open the video room"
        body="Please try again in a moment. If it keeps happening, contact support."
        backHref={backHref}
        backLabel={backLabel}
        retryHref={retryHref}
      />
    );
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col bg-brand">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white md:px-6">
        <p className="truncate font-display text-lg font-semibold">{title}</p>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <Link href={backHref} className="rounded-full px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
            Leave
          </Link>
        </div>
      </div>
      <div className="flex-1 px-2 pb-2 md:px-4 md:pb-4">
        <VideoRoom roomUrl={room.data.url} meetingToken={room.data.token} />
      </div>
    </main>
  );
}
