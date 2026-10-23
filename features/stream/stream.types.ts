export type StreamStatus = "idle" | "live" | "ended";

export interface WatchChannel {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  description: string | null;
}

export interface Stream {
  id: string;
  channelId: string;
  title: string;
  categoryName: string | null;
  status: StreamStatus;
  viewerCount: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  playbackId: string | null;
  posterUrl: string | null;
  tags: string[];
  muxStreamId: string | null;
  muxPlaybackId: string | null;
  streamKeyEncrypted: string | null;
  rtmpUrl: string | null;
  vodAssetIds: string[];
}

export type WatchStream = Stream;

export interface WatchData {
  channel: WatchChannel;
  stream: WatchStream | null;
}

export interface CreateStreamInput {
  channelId: string;
  title: string;
  categoryName?: string | null;
  category?: string | null;
  tags?: string[];
  playbackId?: string | null;
  posterUrl?: string | null;
  muxStreamId?: string | null;
  muxPlaybackId?: string | null;
  streamKeyEncrypted?: string | null;
  rtmpUrl?: string | null;
  vodAssetIds?: string[];
  status?: StreamStatus;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface UpdateStreamInput {
  title?: string;
  categoryName?: string | null;
  status?: StreamStatus;
  viewerCount?: number;
  startedAt?: string | null;
  endedAt?: string | null;
  playbackId?: string | null;
  posterUrl?: string | null;
  tags?: string[];
  muxStreamId?: string | null;
  muxPlaybackId?: string | null;
  streamKeyEncrypted?: string | null;
  rtmpUrl?: string | null;
  vodAssetIds?: string[];
}

export interface Vod {
  id: string;
  streamId: string;
  channelId: string;
  title: string;
  assetIds: string[];
  playbackId: string | null;
  createdAt: string;
}

export interface CreateVodInput {
  streamId: string;
  channelId: string;
  title: string;
  assetIds?: string[];
  playbackId?: string | null;
}

export interface MuxLiveStream {
  id: string;
  streamKey: string;
  playbackId: string | null;
  rtmpUrl?: string | null;
  status?: string;
  assetIds?: string[];
  [key: string]: unknown;
}

export interface GoLiveInput {
  channelId: string;
  title: string;
  category?: string | null;
  categoryName?: string | null;
  tags?: string[];
  ownerId?: string;
}

export interface GoLiveResult {
  stream: Stream;
  muxStream: MuxLiveStream;
  streamKey: string;
  rtmpUrl: string;
  playbackId: string | null;
}

export interface EndStreamInput {
  streamId: string;
  assetIds?: string[];
}

export interface EndStreamResult {
  stream: Stream;
  vod: Vod | null;
}

export interface MuxWebhookEvent {
  type: string;
  data?: {
    id?: string;
    stream_key?: string;
    status?: string;
    started_at?: string;
    ended_at?: string;
    recent_asset_ids?: string[];
    asset_ids?: string[];
    playback_ids?: { id: string }[];
    [key: string]: unknown;
  };
}
