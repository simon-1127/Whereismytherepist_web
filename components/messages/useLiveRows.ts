"use client";

import { useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Change = { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> };

/**
 * Same shape as gendoc's useLiveQueue, for the messaging tables: Supabase
 * Realtime postgres_changes (RLS scopes events to the two participants),
 * plus a slow poll and a refetch on tab focus for dropped sockets.
 *
 * `onChange` gets each event (to append a message straight away);
 * `refetch` runs on poll / focus / reconnect.
 */
export function useLiveRows(
  supabase: SupabaseClient,
  channelName: string,
  table: "messages" | "conversations",
  filters: string[],
  onChange: (change: Change) => void,
  refetch: () => void,
  pollMs = 30_000
) {
  const latestChange = useRef(onChange);
  const latestRefetch = useRef(refetch);
  useEffect(() => {
    latestChange.current = onChange;
    latestRefetch.current = refetch;
  }, [onChange, refetch]);

  const filterKey = filters.join("|");

  useEffect(() => {
    let channel = supabase.channel(channelName);
    for (const filter of filterKey.split("|").filter(Boolean)) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        (payload) => latestChange.current(payload as unknown as Change)
      );
    }
    let subscribedOnce = false;
    channel.subscribe((status: string) => {
      // After a reconnect, catch up on anything missed while offline.
      if (status === "SUBSCRIBED") {
        if (subscribedOnce) latestRefetch.current();
        subscribedOnce = true;
      }
    });

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") latestRefetch.current();
    }, pollMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") latestRefetch.current();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [supabase, channelName, table, filterKey, pollMs]);
}
