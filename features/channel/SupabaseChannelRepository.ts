import type { SupabaseClient } from "@/shared/db/client";

import type { ChannelRepository, MessageRepository, StreamRepository } from "./ChannelRepository";
import type {
  Channel,
  CreateChannelInput,
  CreateMessageInput,
  CreateStreamInput,
  Message,
  Stream,
  UpdateChannelInput,
  UpdateStreamInput,
} from "./channel.types";

function toChannel(row: unknown): Channel {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    ownerId: String(r.owner_id),
    slug: String(r.slug),
    name: String(r.name),
    description: r.description == null ? null : String(r.description),
    avatarUrl: r.avatar_url == null ? null : String(r.avatar_url),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

function toStream(row: unknown): Stream {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    channelId: String(r.channel_id),
    title: String(r.title),
    status: (r.status as Stream["status"]) ?? "idle",
    viewerCount: Number(r.viewer_count ?? 0),
    startedAt: r.started_at == null ? null : String(r.started_at),
    endedAt: r.ended_at == null ? null : String(r.ended_at),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

function toMessage(row: unknown): Message {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    channelId: String(r.channel_id),
    userId: String(r.user_id),
    username: String(r.username),
    body: String(r.body),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

export class SupabaseChannelRepository
  implements ChannelRepository, StreamRepository, MessageRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async getChannelById(id: string): Promise<Channel | null> {
    const { data, error } = await this.client
      .from("channels")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toChannel(data) : null;
  }

  async getChannelBySlug(slug: string): Promise<Channel | null> {
    const { data, error } = await this.client
      .from("channels")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toChannel(data) : null;
  }

  async listChannelsByOwner(ownerId: string): Promise<Channel[]> {
    const { data, error } = await this.client.from("channels").select("*").eq("owner_id", ownerId);
    if (error) throw error;
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return rows.map(toChannel);
  }

  async createChannel(input: CreateChannelInput): Promise<Channel> {
    const { data, error } = await this.client
      .from("channels")
      .insert({
        owner_id: input.ownerId,
        slug: input.slug,
        name: input.name,
        description: input.description ?? null,
        avatar_url: input.avatarUrl ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return toChannel(data);
  }

  async updateChannel(id: string, input: UpdateChannelInput): Promise<Channel> {
    const patch: Record<string, unknown> = {};
    if (input.slug !== undefined) patch.slug = input.slug;
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;
    const { data, error } = await this.client
      .from("channels")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toChannel(data);
  }

  async deleteChannel(id: string): Promise<void> {
    const { error } = await this.client.from("channels").delete().eq("id", id);
    if (error) throw error;
  }

  async getStreamById(id: string): Promise<Stream | null> {
    const { data, error } = await this.client
      .from("streams")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toStream(data) : null;
  }

  async listStreamsByChannel(channelId: string): Promise<Stream[]> {
    const { data, error } = await this.client
      .from("streams")
      .select("*")
      .eq("channel_id", channelId);
    if (error) throw error;
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return rows.map(toStream);
  }

  async getLiveStreamByChannel(channelId: string): Promise<Stream | null> {
    const { data, error } = await this.client
      .from("streams")
      .select("*")
      .eq("channel_id", channelId)
      .eq("status", "live")
      .maybeSingle();
    if (error) throw error;
    return data ? toStream(data) : null;
  }

  async createStream(input: CreateStreamInput): Promise<Stream> {
    const { data, error } = await this.client
      .from("streams")
      .insert({
        channel_id: input.channelId,
        title: input.title,
        status: "idle",
      })
      .select()
      .single();
    if (error) throw error;
    return toStream(data);
  }

  async updateStream(id: string, input: UpdateStreamInput): Promise<Stream> {
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.status !== undefined) patch.status = input.status;
    if (input.viewerCount !== undefined) patch.viewer_count = input.viewerCount;
    if (input.startedAt !== undefined) patch.started_at = input.startedAt;
    if (input.endedAt !== undefined) patch.ended_at = input.endedAt;
    const { data, error } = await this.client
      .from("streams")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toStream(data);
  }

  async deleteStream(id: string): Promise<void> {
    const { error } = await this.client.from("streams").delete().eq("id", id);
    if (error) throw error;
  }

  async listMessages(channelId: string, limit = 50): Promise<Message[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return rows.map(toMessage);
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
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
    return toMessage(data);
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await this.client.from("messages").delete().eq("id", id);
    if (error) throw error;
  }
}

export function createChannelRepository(client: SupabaseClient): ChannelRepository {
  return new SupabaseChannelRepository(client);
}

export function createStreamRepository(client: SupabaseClient): StreamRepository {
  return new SupabaseChannelRepository(client);
}

export function createMessageRepository(client: SupabaseClient): MessageRepository {
  return new SupabaseChannelRepository(client);
}
