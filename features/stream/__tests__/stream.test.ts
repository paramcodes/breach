import { describe, expect, it } from "vitest";
import { InMemoryStreamRepository } from "../in-memory-stream-repository";
import type { StreamRepository } from "../StreamRepository";
import type { WatchData } from "../stream.types";
import { createStreamUseCases, loadWatchData } from "../use-cases";

describe("stream use cases", () => {
  it("loads a live channel and its stream", async () => {
    const data = await loadWatchData("shroud", new InMemoryStreamRepository());

    expect(data?.channel.slug).toBe("shroud");
    expect(data?.stream?.status).toBe("live");
    expect(data?.stream?.playbackId).toBeTruthy();
  });

  it("returns null for an unknown channel", async () => {
    const data = await loadWatchData("does-not-exist", new InMemoryStreamRepository());

    expect(data).toBeNull();
  });

  it("returns channel with null stream when offline", async () => {
    const data = await loadWatchData("nemesis", new InMemoryStreamRepository());

    expect(data?.channel.slug).toBe("nemesis");
    expect(data?.stream).toBeNull();
  });

  it("exposes a stream without playback id for error state", async () => {
    const data = await loadWatchData("vertex", new InMemoryStreamRepository());

    expect(data?.stream?.status).toBe("live");
    expect(data?.stream?.playbackId).toBeNull();
  });

  it("loads sections concurrently through one repository", async () => {
    const repository = new InMemoryStreamRepository();
    const useCases = createStreamUseCases(repository);

    const [first, second] = await Promise.all([
      useCases.loadWatchData("shroud"),
      useCases.loadWatchData("shroud"),
    ]);

    expect(first).toEqual(second);
  });

  it("returns copies so callers cannot mutate repository state", async () => {
    const repository = new InMemoryStreamRepository();
    const first = await repository.getLiveStreamByChannel("shroud");
    first?.tags.push("Mutated");
    if (first) first.viewerCount = 0;

    const second = await repository.getLiveStreamByChannel("shroud");

    expect(second?.tags).not.toContain("Mutated");
    expect(second?.viewerCount).toBeGreaterThan(0);
  });

  it("propagates repository failures", async () => {
    const failing: StreamRepository = {
      getChannelBySlug: async () => {
        throw new Error("offline");
      },
      getLiveStreamByChannel: async () => null,
    };

    await expect(loadWatchData("shroud", failing)).rejects.toThrow("offline");
  });

  it("stays assignable to WatchData", async () => {
    const data: WatchData | null = await loadWatchData("shroud");
    expect(data).not.toBeNull();
  });
});
