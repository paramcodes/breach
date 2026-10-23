import type { PresenceChannel, PresenceState } from "./presence";

type Envelope =
  | { kind: "join"; userId: string; username?: string }
  | { kind: "leave"; userId: string }
  | { kind: "heartbeat"; userId: string };

const HEARTBEAT_MS = 5_000;
const PEER_TIMEOUT_MS = 15_000;

/**
 * Cross-window viewer presence over the browser BroadcastChannel API. Peers
 * announce joins and send heartbeats; peers silent past the timeout are
 * pruned, so counts converge after a window closes without an explicit
 * leave. Count changes only fire on join/leave/prune — not per heartbeat.
 */
export class BroadcastChannelPresence implements PresenceChannel {
  private readonly channel: BroadcastChannel;
  private readonly handlers = new Set<(count: number) => void>();
  private readonly peers = new Map<string, number>();
  private state: PresenceState;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private left = false;

  constructor(
    channelId: string,
    private readonly userId: string,
    state: PresenceState = { userId },
    baseName: string = "breach-chat",
  ) {
    this.state = state;
    this.channel = new BroadcastChannel(`${baseName}:presence:${channelId}`);
    this.channel.onmessage = (event: MessageEvent) => {
      const envelope = event.data as Envelope | undefined;
      if (!envelope || typeof envelope.userId !== "string" || envelope.userId === this.userId) {
        return;
      }
      if (envelope.kind === "join" || envelope.kind === "heartbeat") {
        this.peers.set(envelope.userId, Date.now());
        this.notify();
      } else if (envelope.kind === "leave") {
        this.peers.delete(envelope.userId);
        this.notify();
      }
    };
  }

  join(state?: PresenceState): void {
    if (state) this.state = state;
    this.post({ kind: "join", userId: this.userId, username: this.state.username });
    this.startHeartbeat();
    this.notify();
  }

  leave(): void {
    this.left = true;
    this.stopHeartbeat();
    this.post({ kind: "leave", userId: this.userId });
    this.notify();
  }

  count(): number {
    if (this.left) return this.peers.size;
    return this.peers.size + 1;
  }

  subscribeCount(handler: (count: number) => void): () => void {
    this.handlers.add(handler);
    handler(this.count());
    return () => {
      this.handlers.delete(handler);
    };
  }

  close(): void {
    if (!this.left) this.leave();
    this.stopHeartbeat();
    this.channel.close();
    this.handlers.clear();
  }

  private post(envelope: Envelope): void {
    this.channel.postMessage(envelope);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => {
      this.prune();
      this.post({ kind: "heartbeat", userId: this.userId });
    }, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private prune(): void {
    const cutoff = Date.now() - PEER_TIMEOUT_MS;
    let changed = false;
    for (const [userId, lastSeen] of this.peers) {
      if (lastSeen < cutoff) {
        this.peers.delete(userId);
        changed = true;
      }
    }
    if (changed) this.notify();
  }

  private notify(): void {
    const next = this.count();
    for (const handler of this.handlers) handler(next);
  }
}
