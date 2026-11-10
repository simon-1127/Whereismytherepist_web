import { loadInbox } from "../../lib/messages-server";
import type { Perspective } from "../../lib/messages";
import InboxList from "./InboxList";
import Footer from "../Footer";

/** Server half of /messages and /provider/messages. */
export default async function InboxPage({ perspective }: { perspective: Perspective }) {
  const { userId, rows, failed } = await loadInbox(perspective);
  return (
    <>
      <main className="shell max-w-[860px] py-10 md:py-14">
        <header className="mb-8">
          <h1 className="text-[2.4rem] font-bold md:text-5xl">Messages</h1>
          <p className="mt-2 text-lg text-ink-2">
            {perspective === "client"
              ? "Talk to your therapist between sessions while you have one booked."
              : "Conversations with clients. Clients can message you while they have a session booked."}
          </p>
        </header>
        {failed ? (
          <p role="alert" className="alert alert-error">
            Messages couldn&rsquo;t be loaded right now. Please refresh in a moment.
          </p>
        ) : (
          <InboxList initialRows={rows} userId={userId} perspective={perspective} />
        )}
      </main>
      {perspective === "client" && <Footer />}
    </>
  );
}
