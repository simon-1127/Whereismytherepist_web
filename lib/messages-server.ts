import { notFound, redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getViewer } from "./viewer";
import { MESSAGE_SELECT, messagesBase, type ConversationRow, type Message, type Perspective } from "./messages";

/** How many messages a thread loads at once (newest first, shown oldest -> newest). */
export const THREAD_PAGE = 100;

/**
 * Messaging pages: signed in, and on the right side of the site for the
 * account's role (clients under /messages, therapists under
 * /provider/messages). Doctors never get here (section layouts send them to
 * /gendoc first; this checks again because layouts don't stop a page).
 */
export async function requireMessaging(perspective: Perspective, path: string) {
  const viewer = await getViewer();
  if (!viewer.user) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (viewer.role === "gendoc") redirect("/gendoc");
  const actual: Perspective = viewer.role === "provider" ? "provider" : "client";
  if (actual !== perspective) {
    const rest = path.replace(/^\/(provider\/)?messages/, "");
    redirect(`${messagesBase(actual)}${rest}`);
  }
  const supabase = await createClient();
  return { supabase, userId: viewer.user.id };
}

export async function loadInbox(perspective: Perspective) {
  const { supabase, userId } = await requireMessaging(perspective, messagesBase(perspective));
  const { data, error } = await supabase.rpc("fn_my_conversations", { p_conversation_id: null });
  return { userId, rows: (data || []) as ConversationRow[], failed: !!error };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadThread(perspective: Perspective, id: string) {
  const { supabase, userId } = await requireMessaging(perspective, `${messagesBase(perspective)}/${id}`);
  if (!UUID_RE.test(id)) notFound();

  const { data: rows } = await supabase.rpc("fn_my_conversations", { p_conversation_id: id });
  const conversation = ((rows || []) as ConversationRow[])[0];
  if (!conversation) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(THREAD_PAGE);
  const messages = ((msgs || []) as Message[]).reverse();

  return { userId, conversation, messages, hasMore: (msgs || []).length === THREAD_PAGE };
}
