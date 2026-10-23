import type { BrowseRepository } from "./BrowseRepository";
import type { BrowseHomeData } from "./browse.types";
import { InMemoryBrowseRepository } from "./in-memory-browse-repository";

const defaultRepository = new InMemoryBrowseRepository();

export function createBrowseUseCases(repository: BrowseRepository = defaultRepository) {
  return {
    async loadBrowseHome(): Promise<BrowseHomeData> {
      const [featured, liveStreams, liveChannels, categories] = await Promise.all([
        repository.getFeaturedStreams(),
        repository.getLiveStreams(),
        repository.getLiveChannels(),
        repository.getCategories(),
      ]);
      return { featured, liveStreams, liveChannels, categories };
    },
  };
}

export async function loadBrowseHome(repository?: BrowseRepository): Promise<BrowseHomeData> {
  return createBrowseUseCases(repository).loadBrowseHome();
}
