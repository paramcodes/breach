import { BroadcastChannelPresence } from "./broadcast-presence";
import { RealtimeSocket, resolveRealtimeConfig } from "./realtime-socket";

export interface PresenceState {
  userId: string;
  username?: string;
}

/**
 * Per-channel viewer presence. Implementations track the local viewer and
 * report the distinct viewer count; updates only fire on join and leave, so
 * presence traffic stays low-frequency.
 */
export interface PresenceChannel {
  join(state?: PresenceState): void;
  leave(): void;
  count(): number;
  subscribeCount(handler: (count: number) => void): () => void;
  close(): void;
}

export class InMemoryPresenceStore {
  private readonly channels = new Map<string, Map<string, number>>();

  join(channelId: string, userId: string): number {
    const viewers = this.channels.get(channelId) ?? new Map<string, number>();
    viewers.set(userId, (viewers.get(userId) ?? 0) + 1);
    this.channels.set(channelId, viewers);
    return this.count(channelId);
  }

  leave(channelId: string, userId: string): number {
    const viewers = this.channels.get(channelId);
    if (!viewers) return 0;
    const refs = (viewers.get(userId) ?? 1) - 1;
    if (refs <= 0) viewers.delete(userId);
    else viewers.set(userId, refs);
    return viewers.size;
  }

  count(channelId: string): number {
    return this.channels.get(channelId)?.size ?? 0;
  }

  reset(): void {
    this.channels.clear();
  }
}

const sharedPresenceStore = new InMemoryPresenceStore();

/** Single-process presence channel; used in tests and on the server. */
export class InMemoryPresenceChannel implements PresenceChannel {
  private readonly handlers = new Set<(count: number) => void>();

  constructor(
    private readonly store: InMemoryPresenceStore,
    private readonly channelId: string,
    private readonly userId: string,
  ) {}

  join(state?: PresenceState): void {
    void state;
    const next = this.store.join(this.channelId, this.userId);
    this.notify(next);
  }

  leave(): void {
    const next = this.store.leave(this.channelId, this.userId);
    this.notify(next);
  }

  count(): number {
    return this.store.count(this.channelId);
  }

  subscribeCount(handler: (count: number) => void): () => void {
    this.handlers.add(handler);
    handler(this.count());
    return () => {
      this.handlers.delete(handler);
    };
  }

  close(): void {
    this.handlers.clear();
  }

  private notify(count: number): void {
    for (const handler of this.handlers) handler(count);
  }
}

export function chatPresenceTopic(channelId: string): string {
  return `realtime:chat-presence:${channelId}`;
}

interface PresenceMeta {
  phx_ref?: string;
}

type PresenceMap = Record<string, { metas?: PresenceMeta[] }>;

/** Supabase Realtime presence channel over a shared socket. */
export class SupabasePresenceChannel implements PresenceChannel {
  private readonly topic: string;
  private readonly handlers = new Set<(count: number) => void>();
  private remotes = new Set<string>();
  private tracked = false;
  private joined = false;
  private unsubState: (() => void) | null = null;
  private unsubDiff: (() => void) | null = null;

  constructor(
    private readonly socket: RealtimeSocket,
    channelId: string,
    private readonly userId: string,
  ) {
    this.topic = chatPresenceTopic(channelId);
    this.unsubState = socket.onMessage(this.topic, "presence_state", (payload) => {
      this.remotes = new Set(Object.keys((payload ?? {}) as PresenceMap));
      this.notify();
    });
    this.unsubDiff = socket.onMessage(this.topic, "presence_diff", (payload) => {
      const diff = (payload ?? {}) as { joins?: PresenceMap; leaves?: PresenceMap };
      for (const key of Object.keys(diff.joins ?? {})) this.remotes.add(key);
      for (const key of Object.keys(diff.leaves ?? {})) this.remotes.delete(key);
      this.notify();
    });
    socket.join(this.topic, { presenceKey: this.userId }, () => {
      this.joined = true;
      if (this.tracked) this.sendTrack();
    });
  }

  join(state?: PresenceState): void {
    void state;
    this.tracked = true;
    if (this.joined) this.sendTrack();
  }

  leave(): void {
    this.tracked = false;
    this.socket.push(this.topic, "presence", { type: "untrack" });
    this.notify();
  }

  count(): number {
    const total = this.remotes.size + (this.tracked && this.joined ? 1 : 0);
    return total;
  }

  subscribeCount(handler: (count: number) => void): () => void {
    this.handlers.add(handler);
    handler(this.count());
    return () => {
      this.handlers.delete(handler);
    };
  }

  close(): void {
    this.unsubState?.();
    this.unsubDiff?.();
    this.unsubState = null;
    this.unsubDiff = null;
    this.handlers.clear();
  }

  private sendTrack(): void {
    this.socket.push(this.topic, "presence", {
      type: "track",
      payload: { user_id: this.userId, online_at: new Date().toISOString() },
    });
    this.notify();
  }

  private notify(): void {
    const next = this.count();
    for (const handler of this.handlers) handler(next);
  }
}

/**
 * Presence used when no channel is injected. Prefers a Supabase Realtime
 * presence channel when public env vars are set; falls back to a
 * BroadcastChannel presence (same-origin windows) or in-memory tracking.
 */
export function createDefaultPresence(channelId: string, userId: string): PresenceChannel {
  const config = resolveRealtimeConfig();
  if (config && typeof WebSocket !== "undefined") {
    const socket = new RealtimeSocket(config);
    socket.connect();
    return new SupabasePresenceChannel(socket, channelId, userId);
  }
  if (typeof BroadcastChannel !== "undefined") {
    return new BroadcastChannelPresence(channelId, userId);
  }
  return new InMemoryPresenceChannel(sharedPresenceStore, channelId, userId);
}
