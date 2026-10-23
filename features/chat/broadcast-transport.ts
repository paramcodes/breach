import type { ChatMessage, ChatSettings } from "./chat.types";
import type { ChatTransport } from "./realtime";

type Envelope =
  | { kind: "message"; message: ChatMessage }
  | { kind: "delete"; id: string }
  | { kind: "settings"; settings: ChatSettings };

type EnvelopeHandler = (envelope: Envelope) => void;

/**
 * Cross-window chat transport over the browser BroadcastChannel API. Used as
 * the no-backend fallback so messages, deletes, and settings toggles reach
 * every window of the same origin (two-window live verification without a
 * Supabase project).
 */
export class BroadcastChannelChatTransport implements ChatTransport {
  private readonly channels = new Map<string, BroadcastChannel>();
  private readonly handlers = new Map<string, Set<EnvelopeHandler>>();

  constructor(private readonly baseName: string = "breach-chat") {}

  private channelFor(channelId: string): BroadcastChannel {
    const existing = this.channels.get(channelId);
    if (existing) return existing;
    const channel = new BroadcastChannel(`${this.baseName}:${channelId}`);
    channel.onmessage = (event: MessageEvent) => {
      const envelope = event.data as Envelope | undefined;
      if (!envelope || typeof envelope.kind !== "string") return;
      const set = this.handlers.get(`${envelope.kind}\u0000${channelId}`);
      if (!set) return;
      for (const handler of set) handler(envelope);
    };
    this.channels.set(channelId, channel);
    return channel;
  }

  private subscribe(channelId: string, kind: Envelope["kind"], handler: EnvelopeHandler) {
    const key = `${kind}\u0000${channelId}`;
    const set = this.handlers.get(key) ?? new Set<EnvelopeHandler>();
    set.add(handler);
    this.handlers.set(key, set);
    return () => {
      set.delete(handler);
      if (set.size === 0) this.handlers.delete(key);
    };
  }

  async broadcastMessage(channelId: string, message: ChatMessage): Promise<void> {
    this.channelFor(channelId).postMessage({ kind: "message", message } satisfies Envelope);
  }

  subscribeMessages(channelId: string, handler: (message: ChatMessage) => void): () => void {
    return this.subscribe(channelId, "message", (envelope) => {
      if (envelope.kind === "message") handler(envelope.message);
    });
  }

  async broadcastDelete(channelId: string, messageId: string): Promise<void> {
    this.channelFor(channelId).postMessage({ kind: "delete", id: messageId } satisfies Envelope);
  }

  subscribeDeletes(channelId: string, handler: (messageId: string) => void): () => void {
    return this.subscribe(channelId, "delete", (envelope) => {
      if (envelope.kind === "delete") handler(envelope.id);
    });
  }

  async broadcastSettings(channelId: string, settings: ChatSettings): Promise<void> {
    this.channelFor(channelId).postMessage({ kind: "settings", settings } satisfies Envelope);
  }

  subscribeSettings(channelId: string, handler: (settings: ChatSettings) => void): () => void {
    return this.subscribe(channelId, "settings", (envelope) => {
      if (envelope.kind === "settings") handler(envelope.settings);
    });
  }

  close(): void {
    for (const channel of this.channels.values()) channel.close();
    this.channels.clear();
    this.handlers.clear();
  }
}
