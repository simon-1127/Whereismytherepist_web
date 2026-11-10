"use client";

import { useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Re-runs `refetch` whenever a gendoc_queue_entries row matching `filter`
 * changes (Supabase Realtime; the table is REPLICA IDENTITY FULL and RLS
 * scopes events to the client or doctor on the row). A slow poll and a
 * refetch on tab focus cover dropped sockets.
 *
 * One change usually renumbers several rows (positions + ETAs are
 * recomputed together), so events are coalesced into a single refetch.
 */
export function useLiveQueue(
  supabase: SupabaseClient,
  channelName: string,
  filter: string,
  refetch: () => void,
  pollMs = 30_000
) {
  const latest = useRef(refetch);
  useEffect(() => {
    latest.current = refetch;
  }, [refetch]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const soon = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => latest.current(), 300);
    };

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "gendoc_queue_entries", filter }, soon)
      .subscribe();

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") latest.current();
    }, pollMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") soon();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [supabase, channelName, filter, pollMs]);
}
