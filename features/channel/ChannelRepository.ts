import type { SupabaseClient } from "@/shared/db/client";

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

export interface ChannelRepository {
  getChannelById(id: string): Promise<Channel | null>;
  getChannelBySlug(slug: string): Promise<Channel | null>;
  listChannelsByOwner(ownerId: string): Promise<Channel[]>;
  createChannel(input: CreateChannelInput): Promise<Channel>;
  updateChannel(id: string, input: UpdateChannelInput): Promise<Channel>;
  deleteChannel(id: string): Promise<void>;
}

export interface StreamRepository {
  getStreamById(id: string): Promise<Stream | null>;
  listStreamsByChannel(channelId: string): Promise<Stream[]>;
  getLiveStreamByChannel(channelId: string): Promise<Stream | null>;
  createStream(input: CreateStreamInput): Promise<Stream>;
  updateStream(id: string, input: UpdateStreamInput): Promise<Stream>;
  deleteStream(id: string): Promise<void>;
}

export interface MessageRepository {
  listMessages(channelId: string, limit?: number): Promise<Message[]>;
  createMessage(input: CreateMessageInput): Promise<Message>;
  deleteMessage(id: string): Promise<void>;
}

export type { SupabaseClient };
