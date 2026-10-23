export type ChatMessageId = string;
export type ChatChannelId = string;
export type ChatUserId = string;

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
}

export interface CreateChatMessageInput {
  channelId: string;
  userId: string;
  username: string;
  body: string;
}

export type EmoteStatus = "pending" | "approved" | "rejected";

export interface Emote {
  id: string;
  channelId: string;
  name: string;
  url: string;
  status: EmoteStatus;
  createdAt: string;
}

export interface CreateEmoteInput {
  channelId: string;
  name: string;
  url: string;
  status?: EmoteStatus;
}

/**
 * Chat moderation settings for a channel. `maxMessageLength` is capped at
 * 500 by the send-message use case; the table column carries the value.
 */
export interface ChatSettings {
  slowMode: boolean;
  slowModeSeconds: number;
  emoteOnly: boolean;
  maxMessageLength: number;
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  slowMode: false,
  slowModeSeconds: 5,
  emoteOnly: false,
  maxMessageLength: 500,
};
