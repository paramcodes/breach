import type { SupabaseClient } from "@/shared/db/client";

import type { CreateEmoteInput, Emote, EmoteStatus } from "./emotes.types";

interface EmoteRow {
  id: unknown;
  channel_id: unknown;
  name: unknown;
  url: unknown;
  status?: unknown;
  created_at?: unknown;
}

function toEmote(row: EmoteRow): Emote {
  return {
    id: String(row.id),
    channelId: String(row.channel_id),
    name: String(row.name),
    url: String(row.url),
    status: row.status as EmoteStatus,
    createdAt: String(row.created_at),
  };
}

export type { EmoteStatus } from "./emotes.types";

export class SupabaseEmoteRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listEmotes(channelId: string, status?: string): Promise<Emote[]> {
    let query = this.client.from("emotes").select("*").eq("channel_id", channelId);
    if (status) {
      query = query.eq("status", status);
    }
    const { data, error } = await query;
    if (error) throw error;
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return rows.map(toEmote);
  }

  async createEmote(input: CreateEmoteInput): Promise<Emote> {
    const { data, error } = await this.client
      .from("emotes")
      .insert({
        channel_id: input.channelId,
        name: input.name,
        url: input.url || "",
        status: input.status ?? "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return toEmote((data ?? {}) as EmoteRow);
  }

  async getEmote(id: string): Promise<Emote | null> {
    const { data, error } = await this.client.from("emotes").select("*").eq("id", id).single();
    if (error) throw error;
    if (!data) return null;
    return toEmote(data as EmoteRow);
  }

  async updateEmote(id: string, status: string): Promise<Emote> {
    const { data, error } = await this.client
      .from("emotes")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toEmote((data ?? {}) as EmoteRow);
  }

  async deleteEmote(id: string): Promise<void> {
    const { error } = await this.client.from("emotes").delete().eq("id", id).single();
    if (error) throw error;
  }
}

export function createSupabaseEmoteRepository(client: SupabaseClient): SupabaseEmoteRepository {
  return new SupabaseEmoteRepository(client);
}
