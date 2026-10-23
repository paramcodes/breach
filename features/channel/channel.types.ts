export type ChannelId = string;
export type StreamId = string;

export interface Channel {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CreateChannelInput {
  ownerId: string;
  slug: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateChannelInput {
  slug?: string;
  name?: string;
  description?: string | null;
  avatarUrl?: string | null;
}

export interface Stream {
  id: string;
  channelId: string;
  title: string;
  status: "idle" | "live" | "ended";
  viewerCount: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface CreateStreamInput {
  channelId: string;
  title: string;
}

export interface UpdateStreamInput {
  title?: string;
  status?: "idle" | "live" | "ended";
  viewerCount?: number;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface Follow {
  followerId: string;
  channelId: string;
  createdAt: string;
}

export interface Emote {
  id: string;
  channelId: string;
  name: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
}

export interface CreateMessageInput {
  channelId: string;
  userId: string;
  username: string;
  body: string;
}
