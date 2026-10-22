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

export class InMemoryChannelRepository
  implements ChannelRepository, StreamRepository, MessageRepository
{
  private readonly channels = new Map<string, Channel>();
  private readonly streams = new Map<string, Stream>();
  private readonly messages = new Map<string, Message>();
  private idCounter = 0;

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${this.idCounter}`;
  }

  async getChannelById(id: string): Promise<Channel | null> {
    return this.channels.get(id) ?? null;
  }

  async getChannelBySlug(slug: string): Promise<Channel | null> {
    for (const channel of this.channels.values()) {
      if (channel.slug === slug) return channel;
    }
    return null;
  }

  async listChannelsByOwner(ownerId: string): Promise<Channel[]> {
    return [...this.channels.values()].filter((c) => c.ownerId === ownerId);
  }

  async createChannel(input: CreateChannelInput): Promise<Channel> {
    const channel: Channel = {
      id: this.nextId("channel"),
      ownerId: input.ownerId,
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      avatarUrl: input.avatarUrl ?? null,
      createdAt: new Date().toISOString(),
    };
    this.channels.set(channel.id, channel);
    return channel;
  }

  async updateChannel(id: string, input: UpdateChannelInput): Promise<Channel> {
    const existing = this.channels.get(id);
    if (!existing) throw new Error("Channel not found");
    const updated: Channel = {
      ...existing,
      slug: input.slug ?? existing.slug,
      name: input.name ?? existing.name,
      description: input.description === undefined ? existing.description : input.description,
      avatarUrl: input.avatarUrl === undefined ? existing.avatarUrl : input.avatarUrl,
    };
    this.channels.set(id, updated);
    return updated;
  }

  async deleteChannel(id: string): Promise<void> {
    this.channels.delete(id);
  }

  async getStreamById(id: string): Promise<Stream | null> {
    return this.streams.get(id) ?? null;
  }

  async listStreamsByChannel(channelId: string): Promise<Stream[]> {
    return [...this.streams.values()].filter((s) => s.channelId === channelId);
  }

  async getLiveStreamByChannel(channelId: string): Promise<Stream | null> {
    return (
      [...this.streams.values()].find((s) => s.channelId === channelId && s.status === "live") ??
      null
    );
  }

  async createStream(input: CreateStreamInput): Promise<Stream> {
    const stream: Stream = {
      id: this.nextId("stream"),
      channelId: input.channelId,
      title: input.title,
      status: "idle",
      viewerCount: 0,
      startedAt: null,
      endedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.streams.set(stream.id, stream);
    return stream;
  }

  async updateStream(id: string, input: UpdateStreamInput): Promise<Stream> {
    const existing = this.streams.get(id);
    if (!existing) throw new Error("Stream not found");
    const updated: Stream = {
      ...existing,
      title: input.title ?? existing.title,
      status: input.status ?? existing.status,
      viewerCount: input.viewerCount ?? existing.viewerCount,
      startedAt: input.startedAt === undefined ? existing.startedAt : input.startedAt,
      endedAt: input.endedAt === undefined ? existing.endedAt : input.endedAt,
    };
    this.streams.set(id, updated);
    return updated;
  }

  async deleteStream(id: string): Promise<void> {
    this.streams.delete(id);
  }

  async listMessages(channelId: string, limit = 50): Promise<Message[]> {
    return [...this.messages.values()]
      .filter((m) => m.channelId === channelId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit);
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    const message: Message = {
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
}
