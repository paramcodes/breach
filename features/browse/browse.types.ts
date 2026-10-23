export type BrowseTag = string;

export interface LiveStream {
  id: string;
  title: string;
  channelName: string;
  channelSlug: string;
  viewerCount: number;
  thumbnailUrl: string;
  tags: BrowseTag[];
  categoryName?: string;
  startedAt?: string | null;
}

export interface FeaturedStream extends LiveStream {
  featuredRank?: number;
}

export interface LiveChannel {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  viewerCount: number;
  title: string | null;
}

export interface BrowseCategory {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  viewerCount: number;
}

export interface BrowseHomeData {
  featured: FeaturedStream[];
  liveStreams: LiveStream[];
  liveChannels: LiveChannel[];
  categories: BrowseCategory[];
}
