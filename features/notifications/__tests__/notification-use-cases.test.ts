import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryNotificationRepository } from "../use-cases";

describe("Notification use cases", () => {
  let repo: InMemoryNotificationRepository;

  beforeEach(() => {
    repo = new InMemoryNotificationRepository();
  });

  describe("triggerChannelFollow", () => {
    it("creates a follow notification for the channel owner", async () => {
      repo.triggerChannelFollow("follower-1", "channel-1");

      const unread = await repo.listUnread("channel-1");
      expect(unread).toHaveLength(1);
      expect(unread[0].type).toBe("channel_followed");
      expect(unread[0].message).toBe("follower-1 started following your channel");
      expect(unread[0].read).toBe(false);
    });

    it("assigns the correct user_id (channel owner)", async () => {
      repo.triggerChannelFollow("follower-1", "channel-1");

      const unread = await repo.listUnread("channel-1");
      expect(unread[0].user_id).toBe("channel-1");
    });
  });

  describe("triggerChannelLive", () => {
    it("creates a live notification for the channel owner", async () => {
      repo.triggerChannelLive("channel-1");

      const unread = await repo.listUnread("channel-1");
      expect(unread).toHaveLength(1);
      expect(unread[0].type).toBe("channel_live");
      expect(unread[0].message).toBe("Your stream is now live!");
      expect(unread[0].read).toBe(false);
    });
  });

  describe("markAsRead", () => {
    it("marks a notification as read", async () => {
      repo.triggerChannelFollow("follower-1", "channel-1");

      const unreadBefore = await repo.listUnread("channel-1");
      expect(unreadBefore).toHaveLength(1);

      // Mark the specific notification as read
      const notifications = await repo.listUnread("channel-1");
      const notificationId = notifications[0].id;
      await repo.markAsRead(notificationId);

      const unread = await repo.listUnread("channel-1");
      expect(unread).toHaveLength(0);
    });

    it("does not mark unrelated notifications as read", async () => {
      repo.triggerChannelFollow("follower-1", "channel-1");
      repo.triggerChannelLive("channel-1");

      const unreadBefore = await repo.listUnread("channel-1");
      expect(unreadBefore).toHaveLength(2);

      // Mark the follow notification as read
      const notifications = await repo.listUnread("channel-1");
      const followId = notifications.find((n) => n.type === "channel_followed")?.id;
      if (followId) {
        await repo.markAsRead(followId);
      }

      const unread = await repo.listUnread("channel-1");
      expect(unread).toHaveLength(1);
      expect(unread[0].type).toBe("channel_live");
    });
  });

  describe("listUnread", () => {
    it("returns unread notifications", async () => {
      repo.triggerChannelFollow("follower-1", "channel-1");
      repo.triggerChannelLive("channel-1");

      const unread = await repo.listUnread("channel-1");
      expect(unread).toHaveLength(2);
    });

    it("filters out read notifications", async () => {
      repo.triggerChannelFollow("follower-1", "channel-1");

      const unreadBefore = await repo.listUnread("channel-1");
      expect(unreadBefore).toHaveLength(1);

      const notifications = await repo.listUnread("channel-1");
      const notificationId = notifications[0].id;
      await repo.markAsRead(notificationId);

      const unreadAfter = await repo.listUnread("channel-1");
      expect(unreadAfter).toHaveLength(0);
    });
  });
});
