import { describe, expect, it } from "vitest";

import type { BrowseRepository } from "../BrowseRepository";
import { browseCategorySchema, liveChannelSchema, liveStreamSchema } from "../browse.schema";
import type { BrowseHomeData } from "../browse.types";
import { InMemoryBrowseRepository } from "../in-memory-browse-repository";
import { createBrowseUseCases, loadBrowseHome } from "../use-cases";

describe("browse use cases", () => {
  it("loads every home section from the repository", async () => {
    const data = await loadBrowseHome(new InMemoryBrowseRepository());

    expect(data.featured.length).toBe(3);
    expect(data.liveStreams.length).toBe(6);
    expect(data.liveChannels.length).toBe(5);
    expect(data.categories.length).toBe(4);
    expect(data.featured[0]?.featuredRank).toBe(1);
  });

  it("loads sections concurrently through one repository", async () => {
    const repository = new InMemoryBrowseRepository();
    const useCases = createBrowseUseCases(repository);

    const [first, second] = await Promise.all([
      useCases.loadBrowseHome(),
      useCases.loadBrowseHome(),
    ]);

    expect(first).toEqual(second);
  });

  it("returns copies so callers cannot mutate repository state", async () => {
    const repository = new InMemoryBrowseRepository();
    const first = await repository.getLiveStreams();
    first[0]?.tags.push("Mutated");
    if (first[0]) first[0].viewerCount = 0;

    const second = await repository.getLiveStreams();

    expect(second[0]?.tags).not.toContain("Mutated");
    expect(second[0]?.viewerCount).toBeGreaterThan(0);
  });

  it("propagates repository failures", async () => {
    const failing: BrowseRepository = {
      getFeaturedStreams: async () => {
        throw new Error("offline");
      },
      getLiveStreams: async () => [],
      getLiveChannels: async () => [],
      getCategories: async () => [],
    };

    await expect(loadBrowseHome(failing)).rejects.toThrow("offline");
  });
});

describe("browse schema", () => {
  const stream = {
    id: "s1",
    title: "Ranked grind",
    channelName: "shroud",
    channelSlug: "shroud",
    viewerCount: 100,
    thumbnailUrl: "https://example.com/thumb.jpg",
    tags: ["English"],
  };

  it("parses a valid stream", () => {
    expect(liveStreamSchema.safeParse(stream)).toEqual({
      success: true,
      data: expect.objectContaining({ id: "s1", viewerCount: 100 }),
    });
  });

  it("rejects a stream with a non-numeric viewer count", () => {
    const result = liveStreamSchema.safeParse({ ...stream, viewerCount: "many" });
    expect(result.success).toBe(false);
  });

  it("rejects a channel without a slug", () => {
    const result = liveChannelSchema.safeParse({
      id: "c1",
      name: "shroud",
      avatarUrl: null,
      viewerCount: 10,
      title: null,
    });
    expect(result.success).toBe(false);
  });

  it("requires a slug on category tiles", () => {
    const result = browseCategorySchema.safeParse({
      id: "cat1",
      name: "Valorant",
      imageUrl: "https://example.com/cat.jpg",
      viewerCount: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe("browse home shape", () => {
  it("stays assignable to BrowseHomeData", async () => {
    const data: BrowseHomeData = await loadBrowseHome();
    expect(Object.keys(data).sort()).toEqual([
      "categories",
      "featured",
      "liveChannels",
      "liveStreams",
    ]);
  });
});
