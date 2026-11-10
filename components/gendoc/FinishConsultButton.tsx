"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { rpcMessage } from "../../lib/gendoc";

/** In the doctor's call header: mark the consult complete and go back to the queue. */
export default function FinishConsultButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    setBusy(true);
    setError("");
    const { error: err } = await supabase.rpc("fn_set_gendoc_queue_status", { p_entry_id: entryId, p_status: "completed" });
    if (err) {
      setError(rpcMessage(err, "Couldn't finish the consult."));
      setBusy(false);
      return;
    }
    router.push("/gendoc");
  }

  return (
    <span className="flex items-center gap-2">
      {error && <span role="alert" className="hidden text-sm text-brand-coral sm:inline">{error}</span>}
      <button onClick={finish} disabled={busy} className="btn btn-sm bg-white text-ink hover:bg-lilac">
        {busy ? "Finishing…" : "Finish consult"}
      </button>
    </span>
  );
}
