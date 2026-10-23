import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryFollowRepository } from "../in-memory-repository";
import { createFollowUseCases } from "../use-cases";

describe("ToggleFollow use case", () => {
  let repo: InMemoryFollowRepository;
  let useCases: ReturnType<typeof createFollowUseCases>;

  beforeEach(() => {
    repo = new InMemoryFollowRepository();
    useCases = createFollowUseCases(repo);
  });

  describe("toggleFollow", () => {
    it("follows a channel when not already following", async () => {
      await useCases.toggleFollow({
        followerId: "user-1",
        channelId: "channel-1",
      });

      expect(await repo.isFollowing("user-1", "channel-1")).toBe(true);
      // The follow should have been created
      const followers = await repo.listFollowers("channel-1");
      expect(followers).toHaveLength(1);
      expect(followers[0].follower_id).toBe("user-1");
    });

    it("unfollows a channel when already following", async () => {
      // First, follow
      await useCases.toggleFollow({
        followerId: "user-1",
        channelId: "channel-1",
      });

      // Now unfollow
      await useCases.toggleFollow({
        followerId: "user-1",
        channelId: "channel-1",
      });

      expect(await repo.isFollowing("user-1", "channel-1")).toBe(false);
      const followers = await repo.listFollowers("channel-1");
      expect(followers).toHaveLength(0);
    });

    it("isFollowing returns correct state", async () => {
      expect(await repo.isFollowing("user-1", "channel-1")).toBe(false);

      await useCases.toggleFollow({
        followerId: "user-1",
        channelId: "channel-1",
      });

      expect(await repo.isFollowing("user-1", "channel-1")).toBe(true);
    });
  });

  describe("listFollowing", () => {
    it("lists channels a user follows", async () => {
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-1" });
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-2" });
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-3" });

      const following = await repo.listFollowing("user-1", 10);
      expect(following).toHaveLength(3);
    });

    it("respects limit", async () => {
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-1" });
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-2" });

      const following = await repo.listFollowing("user-1", 1);
      expect(following).toHaveLength(1);
    });
  });

  describe("listFollowers", () => {
    it("lists followers of a channel", async () => {
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-1" });
      await useCases.toggleFollow({ followerId: "user-2", channelId: "channel-1" });

      const followers = await repo.listFollowers("channel-1", 10);
      expect(followers).toHaveLength(2);
    });

    it("respects limit", async () => {
      await useCases.toggleFollow({ followerId: "user-1", channelId: "channel-1" });
      await useCases.toggleFollow({ followerId: "user-2", channelId: "channel-1" });
      await useCases.toggleFollow({ followerId: "user-3", channelId: "channel-1" });

      const followers = await repo.listFollowers("channel-1", 2);
      expect(followers).toHaveLength(2);
    });
  });
});
