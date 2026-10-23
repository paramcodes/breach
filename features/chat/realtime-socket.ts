/**
 * Minimal Supabase Realtime (Phoenix protocol) socket client.
 *
 * Speaks the `vsn=1.0` websocket protocol directly so the chat slice does not
 * need the Supabase SDK:
 * - join a topic with `phx_join`, confirmed by a `phx_reply` with status ok
 * - broadcast with `{ topic, event: "broadcast", payload: { type, event, payload } }`
 * - presence track/untrack with `{ topic, event: "presence", payload: { type } }`
 * - server presence arrives as `presence_state` and `presence_diff` events
 * - a `heartbeat` push every 30s keeps the connection alive
 *
 * The socket reconnects with a capped backoff and re-joins known topics.
 */

import { parseSocketMessage, type SocketMessage } from "./realtime.schema";

export interface RealtimeSocketOptions {
  url: string;
  apiKey: string;
  heartbeatIntervalMs?: number;
  reconnectDelayMs?: number;
}

export interface RealtimeJoinOptions {
  presenceKey?: string;
  broadcastSelf?: boolean;
}

type MessageHandler = (payload: unknown) => void;

const DEFAULT_HEARTBEAT_MS = 30_000;
const DEFAULT_RECONNECT_MS = 3_000;
const MAX_RECONNECT_MS = 30_000;

export function realtimeWebsocketUrl(url: string, apiKey: string): string {
  const base = url.replace(/\/$/, "").replace(/^http/, "ws");
  return `${base}/realtime/v1/websocket?vsn=1.0&apikey=${encodeURIComponent(apiKey)}`;
}

export class RealtimeSocket {
  private ws: WebSocket | null = null;
  private readonly topics = new Map<string, RealtimeJoinOptions>();
  private readonly joined = new Set<string>();
  private readonly handlers = new Map<string, Set<MessageHandler>>();
  private readonly pendingJoins = new Map<string, { topic: string; onOk?: () => void }>();
  private readonly joinCallbacks = new Map<string, (() => void) | undefined>();
  private refCounter = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private closedByUser = false;
  private readonly heartbeatIntervalMs: number;
  private readonly reconnectDelayMs: number;

  constructor(private readonly options: RealtimeSocketOptions) {
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS;
    this.reconnectDelayMs = options.reconnectDelayMs ?? DEFAULT_RECONNECT_MS;
  }

  connect(): void {
    if (this.ws || this.closedByUser || typeof WebSocket === "undefined") return;
    const ws = new WebSocket(realtimeWebsocketUrl(this.options.url, this.options.apiKey));
    this.ws = ws;
    ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      for (const topic of this.topics.keys()) {
        this.joined.delete(topic);
        this.sendJoin(topic);
      }
    };
    ws.onmessage = (event: MessageEvent) => {
      this.handleRaw(typeof event.data === "string" ? event.data : "");
    };
    ws.onclose = () => {
      this.stopHeartbeat();
      this.ws = null;
      if (!this.closedByUser) this.scheduleReconnect();
    };
  }

  /** Join a topic. Joins are queued until the socket is open. */
  join(topic: string, joinOptions: RealtimeJoinOptions = {}, onJoinOk?: () => void): void {
    this.topics.set(topic, joinOptions);
    this.joinCallbacks.set(topic, onJoinOk);
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.joined.has(topic)) {
      this.sendJoin(topic);
    }
  }

  /** Push an event to a topic. Auto-joins the topic when needed. */
  push(topic: string, event: string, payload: unknown): void {
    if (!this.topics.has(topic)) this.join(topic);
    this.send({ topic, event, payload, ref: this.nextRef() });
  }

  /** Subscribe to an event on a topic. Returns an unsubscribe function. */
  onMessage(topic: string, event: string, handler: MessageHandler): () => void {
    const key = `${topic}\u0000${event}`;
    const set = this.handlers.get(key) ?? new Set<MessageHandler>();
    set.add(handler);
    this.handlers.set(key, set);
    return () => {
      set.delete(handler);
      if (set.size === 0) this.handlers.delete(key);
    };
  }

  close(): void {
    this.closedByUser = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.ws?.close();
    this.ws = null;
  }

  private nextRef(): string {
    this.refCounter += 1;
    return String(this.refCounter);
  }

  private send(message: SocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(message));
  }

  private sendJoin(topic: string): void {
    const joinOptions = this.topics.get(topic) ?? {};
    const config: Record<string, unknown> = {
      broadcast: { self: joinOptions.broadcastSelf ?? false },
    };
    if (joinOptions.presenceKey) config.presence = { key: joinOptions.presenceKey };
    const ref = this.nextRef();
    this.pendingJoins.set(ref, { topic, onOk: this.joinCallbacks.get(topic) });
    this.send({ topic, event: "phx_join", payload: { config }, ref });
  }

  private handleRaw(raw: string): void {
    const message = parseSocketMessage(raw);
    if (!message) return;

    if (message.event === "phx_reply") {
      this.handleReply(message);
      return;
    }
    if (message.event === "phx_close" || message.event === "phx_error") {
      this.joined.delete(message.topic);
      return;
    }
    if (message.event === "broadcast") {
      const payload = message.payload as { event?: string; payload?: unknown } | undefined;
      if (payload?.event) this.dispatch(message.topic, payload.event, payload.payload);
      return;
    }
    // presence_state, presence_diff, and any other server events pass through.
    this.dispatch(message.topic, message.event, message.payload);
  }

  private handleReply(message: SocketMessage): void {
    const payload = message.payload as { status?: string; response?: unknown } | undefined;
    const pending = message.ref ? this.pendingJoins.get(message.ref) : undefined;
    if (!pending) return;
    this.pendingJoins.delete(message.ref ?? "");
    if (payload?.status === "ok") {
      this.joined.add(pending.topic);
      pending.onOk?.();
    } else {
      this.joined.delete(pending.topic);
    }
  }

  private dispatch(topic: string, event: string, payload: unknown): void {
    const set = this.handlers.get(`${topic}\u0000${event}`);
    if (!set) return;
    for (const handler of set) handler(payload);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.nextRef() });
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.closedByUser) return;
    this.reconnectAttempts += 1;
    const delay = Math.min(this.reconnectDelayMs * this.reconnectAttempts, MAX_RECONNECT_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

/** Reads the public Supabase realtime config from Next.js env vars. */
export function resolveRealtimeConfig(): RealtimeSocketOptions | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !apiKey) return null;
  return { url, apiKey };
}
