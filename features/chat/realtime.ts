import { BroadcastChannelChatTransport } from "./broadcast-transport";
import type { ChatMessage, ChatSettings } from "./chat.types";
import { RealtimeSocket, resolveRealtimeConfig } from "./realtime-socket";

/**
 * Realtime transport for chat messages, deletions, and settings changes.
 * Implementations deliver events to every connected chat client in the
 * channel; persistence is the repository's job.
 */
export interface ChatTransport {
  broadcastMessage(channelId: string, message: ChatMessage): Promise<void>;
  subscribeMessages(channelId: string, handler: (message: ChatMessage) => void): () => void;
  broadcastDelete(channelId: string, messageId: string): Promise<void>;
  subscribeDeletes(channelId: string, handler: (messageId: string) => void): () => void;
  broadcastSettings(channelId: string, settings: ChatSettings): Promise<void>;
  subscribeSettings(channelId: string, handler: (settings: ChatSettings) => void): () => void;
  close(): void;
}

type MessageHandler<T> = (payload: T) => void;

export class InMemoryChatTransport implements ChatTransport {
  private readonly subs = new Map<string, Set<MessageHandler<unknown>>>();

  private subscribe(key: string, handler: MessageHandler<unknown>): () => void {
    const set = this.subs.get(key) ?? new Set<MessageHandler<unknown>>();
    set.add(handler);
    this.subs.set(key, set);
    return () => {
      set.delete(handler);
      if (set.size === 0) this.subs.delete(key);
    };
  }

  private dispatch(key: string, payload: unknown): void {
    const set = this.subs.get(key);
    if (!set) return;
    for (const handler of set) handler(payload);
  }

  async broadcastMessage(channelId: string, message: ChatMessage): Promise<void> {
    this.dispatch(`message\u0000${channelId}`, message);
  }

  subscribeMessages(channelId: string, handler: MessageHandler<ChatMessage>): () => void {
    return this.subscribe(`message\u0000${channelId}`, handler as MessageHandler<unknown>);
  }

  async broadcastDelete(channelId: string, messageId: string): Promise<void> {
    this.dispatch(`delete\u0000${channelId}`, messageId);
  }

  subscribeDeletes(channelId: string, handler: MessageHandler<string>): () => void {
    return this.subscribe(`delete\u0000${channelId}`, handler as MessageHandler<unknown>);
  }

  async broadcastSettings(channelId: string, settings: ChatSettings): Promise<void> {
    this.dispatch(`settings\u0000${channelId}`, settings);
  }

  subscribeSettings(channelId: string, handler: MessageHandler<ChatSettings>): () => void {
    return this.subscribe(`settings\u0000${channelId}`, handler as MessageHandler<unknown>);
  }

  close(): void {
    this.subs.clear();
  }
}

const MESSAGE_EVENT = "chat:message";
const DELETE_EVENT = "chat:delete";
const SETTINGS_EVENT = "chat:settings";

export function chatTopic(channelId: string): string {
  return `realtime:chat:${channelId}`;
}

/** Supabase Realtime broadcast transport over a shared socket. */
export class SupabaseChatTransport implements ChatTransport {
  constructor(private readonly socket: RealtimeSocket) {}

  async broadcastMessage(channelId: string, message: ChatMessage): Promise<void> {
    this.socket.push(chatTopic(channelId), "broadcast", {
      type: "broadcast",
      event: MESSAGE_EVENT,
      payload: message,
    });
  }

  subscribeMessages(channelId: string, handler: MessageHandler<ChatMessage>): () => void {
    return this.socket.onMessage(chatTopic(channelId), MESSAGE_EVENT, (payload) =>
      handler(payload as ChatMessage),
    );
  }

  async broadcastDelete(channelId: string, messageId: string): Promise<void> {
    this.socket.push(chatTopic(channelId), "broadcast", {
      type: "broadcast",
      event: DELETE_EVENT,
      payload: { id: messageId },
    });
  }

  subscribeDeletes(channelId: string, handler: MessageHandler<string>): () => void {
    return this.socket.onMessage(chatTopic(channelId), DELETE_EVENT, (payload) => {
      const data = payload as { id?: unknown } | undefined;
      if (data && typeof data.id === "string") handler(data.id);
    });
  }

  async broadcastSettings(channelId: string, settings: ChatSettings): Promise<void> {
    this.socket.push(chatTopic(channelId), "broadcast", {
      type: "broadcast",
      event: SETTINGS_EVENT,
      payload: settings,
    });
  }

  subscribeSettings(channelId: string, handler: MessageHandler<ChatSettings>): () => void {
    return this.socket.onMessage(chatTopic(channelId), SETTINGS_EVENT, (payload) =>
      handler(payload as ChatSettings),
    );
  }

  close(): void {
    this.socket.close();
  }
}

/**
 * Transport used when no explicit transport is injected. Prefers a Supabase
 * Realtime socket when public env vars are set; falls back to a
 * BroadcastChannel transport (cross-window on the same origin) so the chat
 * works in local demos without a backend; finally in-memory.
 */
export function createDefaultChatTransport(): ChatTransport {
  const config = resolveRealtimeConfig();
  if (config && typeof WebSocket !== "undefined") {
    const socket = new RealtimeSocket(config);
    socket.connect();
    return new SupabaseChatTransport(socket);
  }
  if (typeof BroadcastChannel !== "undefined") {
    return new BroadcastChannelChatTransport();
  }
  return new InMemoryChatTransport();
}
