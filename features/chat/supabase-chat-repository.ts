import type { SupabaseClient } from "@/shared/db/client";

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

interface MessageRow {
  id: unknown;
  channel_id: unknown;
  user_id: unknown;
  username: unknown;
  body: unknown;
  created_at?: unknown;
}

interface EmoteRow {
  id: unknown;
  channel_id: unknown;
  name: unknown;
  url: unknown;
  status?: unknown;
  created_at?: unknown;
}

interface SettingsRow {
  channel_id?: unknown;
  slow_mode?: unknown;
  slow_mode_seconds?: unknown;
  emote_only?: unknown;
  max_message_length?: unknown;
}

function str(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: str(row.id),
    channelId: str(row.channel_id),
    userId: str(row.user_id),
    username: str(row.username),
    body: str(row.body),
    createdAt: str(row.created_at, new Date().toISOString()),
  };
}

function toEmote(row: EmoteRow): Emote {
  return {
    id: str(row.id),
    channelId: str(row.channel_id),
    name: str(row.name),
    url: str(row.url),
    status: (row.status as EmoteStatus | undefined) ?? "pending",
    createdAt: str(row.created_at, new Date().toISOString()),
  };
}

function toSettings(row: SettingsRow): ChatSettings {
  return {
    slowMode: row.slow_mode === true,
    slowModeSeconds: typeof row.slow_mode_seconds === "number" ? row.slow_mode_seconds : 5,
    emoteOnly: row.emote_only === true,
    maxMessageLength: typeof row.max_message_length === "number" ? row.max_message_length : 500,
  };
}

function toSettingsRow(settings: ChatSettings): SettingsRow {
  return {
    slow_mode: settings.slowMode,
    slow_mode_seconds: settings.slowModeSeconds,
    emote_only: settings.emoteOnly,
    max_message_length: settings.maxMessageLength,
  };
}

export class SupabaseChatRepository implements ChatRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listMessages(channelId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    const rows = (Array.isArray(data) ? data : data ? [data] : []) as MessageRow[];
    return rows.map(toMessage);
  }

  async createMessage(input: CreateChatMessageInput): Promise<ChatMessage> {
    const { data, error } = await this.client
      .from("messages")
      .insert({
        channel_id: input.channelId,
        user_id: input.userId,
        username: input.username,
        body: input.body,
      })
      .select()
      .single();
    if (error) throw error;
    return toMessage((data ?? {}) as MessageRow);
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await this.client.from("messages").delete().eq("id", id).single();
    if (error) throw error;
  }

  async listEmotes(channelId: string, status?: EmoteStatus): Promise<Emote[]> {
    let query = this.client.from("emotes").select("*").eq("channel_id", channelId);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (Array.isArray(data) ? data : data ? [data] : []) as EmoteRow[];
    return rows.map(toEmote);
  }

  async createEmote(input: CreateEmoteInput): Promise<Emote> {
    const { data, error } = await this.client
      .from("emotes")
      .insert({
        channel_id: input.channelId,
        name: input.name,
        url: input.url,
        status: input.status ?? "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return toEmote((data ?? {}) as EmoteRow);
  }

  async deleteEmote(id: string): Promise<void> {
    const { error } = await this.client.from("emotes").delete().eq("id", id).single();
    if (error) throw error;
  }

  async getChatSettings(channelId: string): Promise<ChatSettings> {
    const { data, error } = await this.client
      .from("channel_chat_settings")
      .select("*")
      .eq("channel_id", channelId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ...DEFAULT_CHAT_SETTINGS };
    return toSettings((data ?? {}) as SettingsRow);
  }

  async updateChatSettings(channelId: string, patch: Partial<ChatSettings>): Promise<ChatSettings> {
    const current = await this.getChatSettings(channelId);
    const next: ChatSettings = { ...current, ...patch };
    const row = toSettingsRow(next);
    const { data, error } = await this.client
      .from("channel_chat_settings")
      .update(row)
      .eq("channel_id", channelId)
      .maybeSingle();
    if (error) throw error;
    if (data) return toSettings((data ?? {}) as SettingsRow);
    // No row existed yet; insert the initial settings row.
    const inserted = await this.client
      .from("channel_chat_settings")
      .insert({ channel_id: channelId, ...row })
      .select()
      .single();
    if (inserted.error) throw inserted.error;
    return toSettings((inserted.data ?? {}) as SettingsRow);
  }
}

export function createChatRepository(client: SupabaseClient): ChatRepository {
  return new SupabaseChatRepository(client);
}
