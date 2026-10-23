import type { BrowseCategory, FeaturedStream, LiveChannel, LiveStream } from "./browse.types";

export interface BrowseRepository {
  getFeaturedStreams(): Promise<FeaturedStream[]>;
  getLiveStreams(): Promise<LiveStream[]>;
  getLiveChannels(): Promise<LiveChannel[]>;
  getCategories(): Promise<BrowseCategory[]>;
}
