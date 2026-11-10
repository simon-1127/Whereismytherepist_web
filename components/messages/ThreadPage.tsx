import { loadThread } from "../../lib/messages-server";
import type { Perspective } from "../../lib/messages";
import ThreadView from "./ThreadView";

/** Server half of /messages/[id] and /provider/messages/[id]. */
export default async function ThreadPage({ perspective, id }: { perspective: Perspective; id: string }) {
  const { userId, conversation, messages, hasMore } = await loadThread(perspective, id);
  return (
    <main className="shell max-w-[860px] py-8 md:py-12">
      <ThreadView
        key={conversation.conversation_id}
        conversation={conversation}
        initialMessages={messages}
        initialHasMore={hasMore}
        userId={userId}
        perspective={perspective}
      />
    </main>
  );
}
