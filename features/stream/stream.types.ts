export type StreamStatus = "idle" | "live" | "ended";

export interface WatchChannel {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  description: string | null;
}

export interface WatchStream {
  id: string;
  channelId: string;
  title: string;
  categoryName: string | null;
  status: StreamStatus;
  viewerCount: number;
  startedAt: string | null;
  playbackId: string | null;
  posterUrl: string | null;
  tags: string[];
}

export interface WatchData {
  channel: WatchChannel;
  stream: WatchStream | null;
}
