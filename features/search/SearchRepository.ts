import type { SearchableCategory, SearchableChannel } from "./search.types";

export interface SearchRepository {
  searchChannels(query: string): Promise<SearchableChannel[]>;
  searchCategories(query: string): Promise<SearchableCategory[]>;
  getRecentSearches(): Promise<string[]>;
  addRecentSearch(query: string): Promise<void>;
}
