import type { BrowseRepository } from "./BrowseRepository";
import type { BrowseCategory, FeaturedStream, LiveChannel, LiveStream } from "./browse.types";

const thumbnail = (label: string, background: string) =>
  `https://placehold.co/640x360/${background}/ffffff?text=${encodeURIComponent(label)}`;

const liveStreams: LiveStream[] = [
  {
    id: "s1",
    title: "Ranked grind to Grandmaster",
    channelName: "shroud",
    channelSlug: "shroud",
    viewerCount: 42100,
    thumbnailUrl: thumbnail("Valorant", "7c2d12"),
    tags: ["English", "FPS"],
    categoryName: "Valorant",
    startedAt: "2026-10-23T10:00:00.000Z",
  },
  {
    id: "s2",
    title: "Chill music and chat",
    channelName: "lirik",
    channelSlug: "lirik",
    viewerCount: 18300,
    thumbnailUrl: thumbnail("Just Chatting", "ea580c"),
    tags: ["English", "Music"],
    categoryName: "Just Chatting",
    startedAt: "2026-10-23T09:30:00.000Z",
  },
  {
    id: "s3",
    title: "Speedrun attempts, no deaths",
    channelName: "summit1g",
    channelSlug: "summit1g",
    viewerCount: 9700,
    thumbnailUrl: thumbnail("Minecraft", "9a3412"),
    tags: ["English", "Speedrun"],
    categoryName: "Minecraft",
    startedAt: "2026-10-23T08:45:00.000Z",
  },
  {
    id: "s4",
    title: "Late night build battle",
    channelName: "pokimane",
    channelSlug: "pokimane",
    viewerCount: 7600,
    thumbnailUrl: thumbnail("Building", "c2410c"),
    tags: ["English", "Creative"],
    categoryName: "Fortnite",
    startedAt: "2026-10-23T08:10:00.000Z",
  },
  {
    id: "s5",
    title: "Co-op horror first playthrough",
    channelName: "aurateur",
    channelSlug: "aurateur",
    viewerCount: 5200,
    thumbnailUrl: thumbnail("Horror", "7c2d12"),
    tags: ["English", "Co-op"],
    categoryName: "Horror",
    startedAt: "2026-10-23T07:55:00.000Z",
  },
  {
    id: "s6",
    title: "Learning Japanese with chat",
    channelName: "kaceytron",
    channelSlug: "kaceytron",
    viewerCount: 3100,
    thumbnailUrl: thumbnail("Education", "ea580c"),
    tags: ["English", "Educational"],
    categoryName: "Just Chatting",
    startedAt: "2026-10-23T07:30:00.000Z",
  },
];

const featured: FeaturedStream[] = liveStreams.slice(0, 3).map((stream, index) => ({
  ...stream,
  featuredRank: index + 1,
}));

const liveChannels: LiveChannel[] = liveStreams.slice(0, 5).map((stream, index) => ({
  id: `c${index + 1}`,
  name: stream.channelName,
  slug: stream.channelSlug,
  avatarUrl: `https://placehold.co/80x80/${index % 2 === 0 ? "7c2d12" : "ea580c"}/ffffff?text=${stream.channelName.charAt(0).toUpperCase()}`,
  viewerCount: stream.viewerCount,
  title: stream.title,
}));

const categories: BrowseCategory[] = [
  {
    id: "cat1",
    slug: "just-chatting",
    name: "Just Chatting",
    imageUrl: thumbnail("Just Chatting", "ea580c"),
    viewerCount: 250000,
  },
  {
    id: "cat2",
    slug: "valorant",
    name: "Valorant",
    imageUrl: thumbnail("Valorant", "9a3412"),
    viewerCount: 120000,
  },
  {
    id: "cat3",
    slug: "minecraft",
    name: "Minecraft",
    imageUrl: thumbnail("Minecraft", "7c2d12"),
    viewerCount: 80000,
  },
  {
    id: "cat4",
    slug: "fortnite",
    name: "Fortnite",
    imageUrl: thumbnail("Fortnite", "c2410c"),
    viewerCount: 64000,
  },
];

function cloneStream<T extends LiveStream>(stream: T): T {
  return { ...stream, tags: [...stream.tags] };
}

export class InMemoryBrowseRepository implements BrowseRepository {
  async getFeaturedStreams(): Promise<FeaturedStream[]> {
    return featured.map(cloneStream);
  }

  async getLiveStreams(): Promise<LiveStream[]> {
    return liveStreams.map(cloneStream);
  }

  async getLiveChannels(): Promise<LiveChannel[]> {
    return liveChannels.map((channel) => ({ ...channel }));
  }

  async getCategories(): Promise<BrowseCategory[]> {
    return categories.map((category) => ({ ...category }));
  }
}
