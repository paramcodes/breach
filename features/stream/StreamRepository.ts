import type {
  CreateStreamInput,
  CreateVodInput,
  Stream,
  UpdateStreamInput,
  Vod,
  WatchChannel,
} from "./stream.types";

export interface StreamRepository {
  getChannelBySlug(slug: string): Promise<WatchChannel | null>;
  getLiveStreamByChannel(channelId: string): Promise<Stream | null>;

  getChannelById?(id: string): Promise<WatchChannel | null>;
  getStreamById?(id: string): Promise<Stream | null>;
  getStreamByMuxId?(muxStreamId: string): Promise<Stream | null>;
  listStreamsByChannel?(channelId: string): Promise<Stream[]>;
  createStream?(input: CreateStreamInput): Promise<Stream>;
  updateStream?(id: string, input: UpdateStreamInput): Promise<Stream>;
  deleteStream?(id: string): Promise<void>;

  createVod?(input: CreateVodInput): Promise<Vod>;
  listVodsByChannel?(channelId: string): Promise<Vod[]>;
}

export type { WatchChannel };
