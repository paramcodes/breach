export interface SearchableChannel {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  viewerCount: number;
  title: string | null;
}

export interface SearchableCategory {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  viewerCount: number;
}

export interface SearchResult {
  channels: SearchableChannel[];
  categories: SearchableCategory[];
}

export interface SearchRepository {
  searchChannels(query: string): Promise<SearchableChannel[]>;
  searchCategories(query: string): Promise<SearchableCategory[]>;
  getRecentSearches(): Promise<string[]>;
  addRecentSearch(query: string): Promise<void>;
}
