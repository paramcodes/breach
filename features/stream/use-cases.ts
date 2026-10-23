import { InMemoryStreamRepository } from "./in-memory-stream-repository";
import type { StreamRepository } from "./StreamRepository";
import type { WatchData } from "./stream.types";

const defaultRepository = new InMemoryStreamRepository();

export function createStreamUseCases(repository: StreamRepository = defaultRepository) {
  return {
    async loadWatchData(slug: string): Promise<WatchData | null> {
      const channel = await repository.getChannelBySlug(slug);
      if (!channel) return null;
      const stream = await repository.getLiveStreamByChannel(channel.id);
      return { channel, stream };
    },
  };
}

export async function loadWatchData(
  slug: string,
  repository?: StreamRepository,
): Promise<WatchData | null> {
  return createStreamUseCases(repository).loadWatchData(slug);
}
