"use client";

import { useEffect, useState } from "react";

import { createDefaultPresence, type PresenceChannel } from "../presence";

type UsePresenceOptions = {
  channelId: string;
  userId?: string;
};

/**
 * Track viewer presence for a channel. Joins on mount and leaves on unmount;
 * count changes (join/leave/prune) are pushed through `subscribeCount`.
 * Presence traffic stays low-frequency by design.
 */
export function usePresence({ channelId, userId }: UsePresenceOptions) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const tracker: PresenceChannel = createDefaultPresence(channelId, userId);
    tracker.join();
    setCount(tracker.count());
    const unsub = tracker.subscribeCount(setCount);
    return () => {
      tracker.leave();
      tracker.close();
      unsub();
    };
  }, [channelId, userId]);

  return { viewerCount: count };
}
