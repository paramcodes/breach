import type {
  ChatMessage,
  ChatSettings,
  CreateChatMessageInput,
  CreateEmoteInput,
  Emote,
  EmoteStatus,
} from "./chat.types";

/**
 * Persistence port for the chat slice. Messages, emote listings (needed for
 * emote replacement and emote-only validation), and per-channel settings.
 */
export interface ChatRepository {
  listMessages(channelId: string, limit?: number): Promise<ChatMessage[]>;
  createMessage(input: CreateChatMessageInput): Promise<ChatMessage>;
  deleteMessage(id: string): Promise<void>;
  listEmotes(channelId: string, status?: EmoteStatus): Promise<Emote[]>;
  createEmote(input: CreateEmoteInput): Promise<Emote>;
  deleteEmote(id: string): Promise<void>;
  getChatSettings(channelId: string): Promise<ChatSettings>;
  updateChatSettings(channelId: string, patch: Partial<ChatSettings>): Promise<ChatSettings>;
}
