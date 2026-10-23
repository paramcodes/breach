import { defaultSearchRepository } from "./in-memory-search-repository";
import type { SearchRepository } from "./SearchRepository";
import type { SearchResult } from "./search.types";

export function createSearchUseCases(repository: SearchRepository = defaultSearchRepository) {
  return {
    async search(query: string): Promise<SearchResult> {
      const [channels, categories] = await Promise.all([
        repository.searchChannels(query),
        repository.searchCategories(query),
      ]);
      if (query.trim()) await repository.addRecentSearch(query);
      return { channels, categories };
    },
    async getRecentSearches(): Promise<string[]> {
      return repository.getRecentSearches();
    },
  };
}

export async function search(query: string, repository?: SearchRepository): Promise<SearchResult> {
  return createSearchUseCases(repository).search(query);
}
