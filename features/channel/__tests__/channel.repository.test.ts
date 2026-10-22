import { describe, expect, it } from "vitest";

import { InMemoryChannelRepository } from "../in-memory-channel-repository";

describe("InMemoryChannelRepository", () => {
  it("creates and fetches a channel by slug", async () => {
    const repo = new InMemoryChannelRepository();
    const created = await repo.createChannel({
      ownerId: "u1",
      slug: "alice",
      name: "Alice",
    });
    const found = await repo.getChannelBySlug("alice");
    expect(found?.id).toBe(created.id);
  });

  it("updates and deletes a channel", async () => {
    const repo = new InMemoryChannelRepository();
    const created = await repo.createChannel({
      ownerId: "u1",
      slug: "alice",
      name: "Alice",
    });
    const updated = await repo.updateChannel(created.id, { name: "Alice2" });
    expect(updated.name).toBe("Alice2");
    await repo.deleteChannel(created.id);
    expect(await repo.getChannelById(created.id)).toBeNull();
  });

  it("creates messages and streams", async () => {
    const repo = new InMemoryChannelRepository();
    const channel = await repo.createChannel({
      ownerId: "u1",
      slug: "alice",
      name: "Alice",
    });
    const stream = await repo.createStream({ channelId: channel.id, title: "Live" });
    expect(stream.status).toBe("idle");
    const message = await repo.createMessage({
      channelId: channel.id,
      userId: "u2",
      username: "bob",
      body: "hi",
    });
    const messages = await repo.listMessages(channel.id);
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe(message.id);
  });
});
