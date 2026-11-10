"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { rpcMessage } from "../../lib/gendoc";

/**
 * fn_join_gendoc_queue: idempotent (already in line → the same entry back)
 * and raises friendly errors ("The doctor is not working today", "Today's
 * queue is full…"), which are shown as-is.
 *
 * No "reason" box, same as the app: the deployed function accepts p_reason
 * but doesn't store it, and employees can't update their row afterwards.
 */
export default function JoinQueueButton({ gendocId }: { gendocId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase.rpc("fn_join_gendoc_queue", { p_gendoc_id: gendocId, p_reason: null });
    if (err || !data) {
      setError(rpcMessage(err, "Couldn't join the queue. Please try again."));
      setBusy(false);
      return;
    }
    router.push(`/company-doctor/consult/${data as string}`);
  }

  return (
    <div>
      {error && <p role="alert" className="alert alert-error mb-3">{error}</p>}
      <button onClick={join} disabled={busy} className="btn btn-primary w-full">
        {busy ? "Joining…" : "Join the queue"}
      </button>
    </div>
  );
}
