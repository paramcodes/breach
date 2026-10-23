import type { StreamRepository } from "./StreamRepository";
import type { WatchChannel, WatchStream } from "./stream.types";

/**
 * Public Mux test asset. It keeps the watch surface playable until the stream
 * slice creates real live playback ids.
 */
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

export const demoStreams: WatchStream[] = [
  {
    id: "stream-shroud",
    channelId: "shroud",
    title: "Ranked grind to Grandmaster",
    categoryName: "Valorant",
    status: "live",
    viewerCount: 42100,
    startedAt: "2026-10-23T10:00:00.000Z",
    playbackId: DEMO_PLAYBACK_ID,
    posterUrl: null,
    tags: ["English", "FPS"],
  },
  {
    id: "stream-lirik",
    channelId: "lirik",
    title: "Chill music and chat",
    categoryName: "Just Chatting",
    status: "live",
    viewerCount: 18300,
    startedAt: "2026-10-23T09:30:00.000Z",
    playbackId: DEMO_PLAYBACK_ID,
    posterUrl: null,
    tags: ["English", "Music"],
  },
  {
    id: "stream-summit1g",
    channelId: "summit1g",
    title: "Speedrun attempts, no deaths",
    categoryName: "Minecraft",
    status: "live",
    viewerCount: 9700,
    startedAt: "2026-10-23T08:45:00.000Z",
    playbackId: DEMO_PLAYBACK_ID,
    posterUrl: null,
    tags: ["English", "Speedrun"],
  },
  {
    id: "stream-vertex",
    channelId: "vertex",
    title: "Live build session",
    categoryName: "Software Development",
    status: "live",
    viewerCount: 128,
    startedAt: "2026-10-23T08:20:00.000Z",
    // No playback id yet, so the watch surface exercises its player error state.
    playbackId: null,
    posterUrl: null,
    tags: ["English", "Tech"],
  },
];

function cloneChannel(channel: WatchChannel): WatchChannel {
  return { ...channel };
}

function cloneStream(stream: WatchStream): WatchStream {
  return { ...stream, tags: [...stream.tags] };
}

export class InMemoryStreamRepository implements StreamRepository {
  constructor(
    private readonly channels: WatchChannel[] = demoChannels,
    private readonly streams: WatchStream[] = demoStreams,
  ) {}

  async getChannelBySlug(slug: string): Promise<WatchChannel | null> {
    const channel = this.channels.find((candidate) => candidate.slug === slug);
    return channel ? cloneChannel(channel) : null;
  }

  async getLiveStreamByChannel(channelId: string): Promise<WatchStream | null> {
    const stream = this.streams.find(
      (candidate) => candidate.channelId === channelId && candidate.status === "live",
    );
    return stream ? cloneStream(stream) : null;
  }
}
