import type { ChatRepository } from "./ChatRepository";
import type {
  ChatMessage,
  ChatSettings,
  CreateChatMessageInput,
  CreateEmoteInput,
  Emote,
  EmoteStatus,
} from "./chat.types";
import { DEFAULT_CHAT_SETTINGS } from "./chat.types";

export class InMemoryChatRepository implements ChatRepository {
  private readonly messages = new Map<string, ChatMessage>();
  private readonly emotes = new Map<string, Emote>();
  private readonly settings = new Map<string, ChatSettings>();
  private idCounter = 0;

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${this.idCounter}`;
  }

  async listMessages(channelId: string, limit = 50): Promise<ChatMessage[]> {
    return [...this.messages.values()]
      .filter((message) => message.channelId === channelId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-limit);
  }

  async createMessage(input: CreateChatMessageInput): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.nextId("message"),
      channelId: input.channelId,
      userId: input.userId,
      username: input.username,
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async deleteMessage(id: string): Promise<void> {
    this.messages.delete(id);
  }

  async listEmotes(channelId: string, status?: EmoteStatus): Promise<Emote[]> {
    return [...this.emotes.values()].filter((emote) => {
      if (emote.channelId !== channelId) return false;
      if (status && emote.status !== status) return false;
      return true;
    });
  }

  async createEmote(input: CreateEmoteInput): Promise<Emote> {
    const emote: Emote = {
      id: this.nextId("emote"),
      channelId: input.channelId,
      name: input.name,
      url: input.url,
      status: input.status ?? "pending",
      createdAt: new Date().toISOString(),
    };
    this.emotes.set(emote.id, emote);
    return emote;
  }

  async deleteEmote(id: string): Promise<void> {
    this.emotes.delete(id);
  }

  async getChatSettings(channelId: string): Promise<ChatSettings> {
    return this.settings.get(channelId) ?? { ...DEFAULT_CHAT_SETTINGS };
  }

  async updateChatSettings(channelId: string, patch: Partial<ChatSettings>): Promise<ChatSettings> {
    const current = await this.getChatSettings(channelId);
    const next: ChatSettings = { ...current, ...patch };
    this.settings.set(channelId, next);
    return next;
  }
}
