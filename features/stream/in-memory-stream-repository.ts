import type { StreamRepository } from "./StreamRepository";
import type {
  CreateStreamInput,
  CreateVodInput,
  Stream,
  UpdateStreamInput,
  Vod,
  WatchChannel,
} from "./stream.types";

const DEMO_PLAYBACK_ID = "qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpmaB00CUisJ4";

const avatar = (name: string, background: string) =>
  `https://placehold.co/80x80/${background}/ffffff?text=${name.charAt(0).toUpperCase()}`;

export const demoChannels: WatchChannel[] = [
  {
    id: "shroud",
    slug: "shroud",
    name: "shroud",
    avatarUrl: avatar("shroud", "7c2d12"),
    description: "FPS aim, ranked grinds, and the occasional co-op detour.",
  },
  {
    id: "lirik",
    slug: "lirik",
    name: "lirik",
    avatarUrl: avatar("lirik", "ea580c"),
    description: "Variety streams, mostly whatever looks fun that day.",
  },
  {
    id: "summit1g",
    slug: "summit1g",
    name: "summit1g",
    avatarUrl: avatar("summit1g", "9a3412"),
    description: "Speedruns, shooters, and a lot of talking.",
  },
  {
    id: "nemesis",
    slug: "nemesis",
    name: "nemesis",
    avatarUrl: avatar("nemesis", "c2410c"),
    description: "Mid-lane main. Back tomorrow.",
  },
  {
    id: "vertex",
    slug: "vertex",
    name: "vertex",
    avatarUrl: avatar("vertex", "7c2d12"),
    description: "Building things live. Stream keys rotate daily.",
  },
];

function makeStream(partial: Partial<Stream> & Pick<Stream, "id" | "channelId" | "title">): Stream {
  return {
    categoryName: null,
    status: "live",
    viewerCount: 0,
    startedAt: null,
    endedAt: null,
    createdAt: new Date().toISOString(),
    playbackId: null,
    posterUrl: null,
    tags: [],
    muxStreamId: null,
    muxPlaybackId: null,
    streamKeyEncrypted: null,
    rtmpUrl: null,
    vodAssetIds: [],
    ...partial,
  };
}

export const demoStreams: Stream[] = [
  makeStream({
    id: "stream-shroud",
    channelId: "shroud",
    title: "Ranked grind to Grandmaster",
    categoryName: "Valorant",
    status: "live",
    viewerCount: 42100,
    startedAt: "2026-10-23T10:00:00.000Z",
    playbackId: DEMO_PLAYBACK_ID,
    tags: ["English", "FPS"],
  }),
  makeStream({
    id: "stream-lirik",
    channelId: "lirik",
    title: "Chill music and chat",
    categoryName: "Just Chatting",
    status: "live",
    viewerCount: 18300,
    startedAt: "2026-10-23T09:30:00.000Z",
    playbackId: DEMO_PLAYBACK_ID,
    tags: ["English", "Music"],
  }),
  makeStream({
    id: "stream-summit1g",
    channelId: "summit1g",
    title: "Speedrun attempts, no deaths",
    categoryName: "Minecraft",
    status: "live",
    viewerCount: 9700,
    startedAt: "2026-10-23T08:45:00.000Z",
    playbackId: DEMO_PLAYBACK_ID,
    tags: ["English", "Speedrun"],
  }),
  makeStream({
    id: "stream-vertex",
    channelId: "vertex",
    title: "Live build session",
    categoryName: "Software Development",
    status: "live",
    viewerCount: 128,
    startedAt: "2026-10-23T08:20:00.000Z",
    playbackId: null,
    tags: ["English", "Tech"],
  }),
];

function cloneChannel(channel: WatchChannel): WatchChannel {
  return { ...channel };
}

function cloneStream(stream: Stream): Stream {
  return { ...stream, tags: [...stream.tags], vodAssetIds: [...stream.vodAssetIds] };
}

function cloneVod(vod: Vod): Vod {
  return { ...vod, assetIds: [...vod.assetIds] };
}

export class InMemoryStreamRepository implements StreamRepository {
  private readonly channels = new Map<string, WatchChannel>();
  private readonly streams = new Map<string, Stream>();
  private readonly vods = new Map<string, Vod>();
  private idCounter = 0;

  constructor(channels: WatchChannel[] = demoChannels, streams: Stream[] = demoStreams) {
    for (const channel of channels) this.channels.set(channel.id, cloneChannel(channel));
    for (const stream of streams) this.streams.set(stream.id, cloneStream(stream));
  }

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${this.idCounter}`;
  }

  async getChannelBySlug(slug: string): Promise<WatchChannel | null> {
    for (const channel of this.channels.values()) {
      if (channel.slug === slug) return cloneChannel(channel);
    }
    return null;
  }

  async getChannelById(id: string): Promise<WatchChannel | null> {
    const channel = this.channels.get(id);
    return channel ? cloneChannel(channel) : null;
  }

  async getLiveStreamByChannel(channelId: string): Promise<Stream | null> {
    const stream = [...this.streams.values()].find(
      (candidate) => candidate.channelId === channelId && candidate.status === "live",
    );
    return stream ? cloneStream(stream) : null;
  }

  async getStreamById(id: string): Promise<Stream | null> {
    const stream = this.streams.get(id);
    return stream ? cloneStream(stream) : null;
  }

  async getStreamByMuxId(muxStreamId: string): Promise<Stream | null> {
    const stream = [...this.streams.values()].find(
      (candidate) => candidate.muxStreamId === muxStreamId,
    );
    return stream ? cloneStream(stream) : null;
  }

  async listStreamsByChannel(channelId: string): Promise<Stream[]> {
    return [...this.streams.values()]
      .filter((stream) => stream.channelId === channelId)
      .map(cloneStream);
  }

  async createStream(input: CreateStreamInput): Promise<Stream> {
    const stream: Stream = {
      id: this.nextId("stream"),
      channelId: input.channelId,
      title: input.title,
      categoryName: input.categoryName ?? input.category ?? null,
      status: input.status ?? "idle",
      viewerCount: 0,
      startedAt: input.startedAt ?? null,
      endedAt: input.endedAt ?? null,
      createdAt: new Date().toISOString(),
      playbackId: input.playbackId ?? input.muxPlaybackId ?? null,
      posterUrl: input.posterUrl ?? null,
      tags: input.tags ? [...input.tags] : [],
      muxStreamId: input.muxStreamId ?? null,
      muxPlaybackId: input.muxPlaybackId ?? input.playbackId ?? null,
      streamKeyEncrypted: input.streamKeyEncrypted ?? null,
      rtmpUrl: input.rtmpUrl ?? null,
      vodAssetIds: input.vodAssetIds ? [...input.vodAssetIds] : [],
    };
    this.streams.set(stream.id, stream);
    return cloneStream(stream);
  }

  async updateStream(id: string, input: UpdateStreamInput): Promise<Stream> {
    const existing = this.streams.get(id);
    if (!existing) throw new Error("Stream not found");
    const updated: Stream = {
      ...existing,
      title: input.title ?? existing.title,
      categoryName: input.categoryName === undefined ? existing.categoryName : input.categoryName,
      status: input.status ?? existing.status,
      viewerCount: input.viewerCount ?? existing.viewerCount,
      startedAt: input.startedAt === undefined ? existing.startedAt : input.startedAt,
      endedAt: input.endedAt === undefined ? existing.endedAt : input.endedAt,
      playbackId: input.playbackId === undefined ? existing.playbackId : input.playbackId,
      posterUrl: input.posterUrl === undefined ? existing.posterUrl : input.posterUrl,
      tags: input.tags ? [...input.tags] : existing.tags,
      muxStreamId: input.muxStreamId === undefined ? existing.muxStreamId : input.muxStreamId,
      muxPlaybackId:
        input.muxPlaybackId === undefined ? existing.muxPlaybackId : input.muxPlaybackId,
      streamKeyEncrypted:
        input.streamKeyEncrypted === undefined
          ? existing.streamKeyEncrypted
          : input.streamKeyEncrypted,
      rtmpUrl: input.rtmpUrl === undefined ? existing.rtmpUrl : input.rtmpUrl,
      vodAssetIds: input.vodAssetIds ? [...input.vodAssetIds] : existing.vodAssetIds,
    };
    this.streams.set(id, updated);
    return cloneStream(updated);
  }

  async deleteStream(id: string): Promise<void> {
    this.streams.delete(id);
  }

  async createVod(input: CreateVodInput): Promise<Vod> {
    const vod: Vod = {
      id: this.nextId("vod"),
      streamId: input.streamId,
      channelId: input.channelId,
      title: input.title,
      assetIds: input.assetIds ? [...input.assetIds] : [],
      playbackId: input.playbackId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.vods.set(vod.id, vod);
    return cloneVod(vod);
  }

  async listVodsByChannel(channelId: string): Promise<Vod[]> {
    return [...this.vods.values()].filter((vod) => vod.channelId === channelId).map(cloneVod);
  }
}
