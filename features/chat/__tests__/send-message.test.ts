import { describe, expect, it } from "vitest";

import { InMemoryChatRepository } from "../in-memory-chat-repository";
import { createChatUseCases } from "../use-cases";

describe("SendMessage use case", () => {
  it("persists and returns a message", async () => {
    const repo = new InMemoryChatRepository();
    const useCases = createChatUseCases(repo);
    const message = await useCases.sendMessage({
      channelId: "ch1",
      userId: "u1",
      username: "alice",
      body: "hello",
    });
    expect(message.body).toBe("hello");
    const stored = await repo.listMessages("ch1");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(message.id);
  });

  it("rejects empty messages", async () => {
    const repo = new InMemoryChatRepository();
    const useCases = createChatUseCases(repo);
    await expect(
      useCases.sendMessage({ channelId: "ch1", userId: "u1", username: "alice", body: "   " }),
    ).rejects.toThrow();
  });

  it("rejects messages over 500 chars", async () => {
    const repo = new InMemoryChatRepository();
    const useCases = createChatUseCases(repo);
    await expect(
      useCases.sendMessage({
        channelId: "ch1",
        userId: "u1",
        username: "alice",
        body: "a".repeat(501),
      }),
    ).rejects.toThrow();
  });

  it("enforces emote-only mode", async () => {
    const repo = new InMemoryChatRepository();
    const emote = await repo.createEmote({
      channelId: "ch1",
      name: "Kappa",
      url: "https://example.com/kappa.png",
      status: "approved",
    });
    void emote;
    await repo.updateChatSettings("ch1", { emoteOnly: true });
    const useCases = createChatUseCases(repo);
    await expect(
      useCases.sendMessage({ channelId: "ch1", userId: "u1", username: "alice", body: "hello" }),
    ).rejects.toThrow();
    const message = await useCases.sendMessage({
      channelId: "ch1",
      userId: "u1",
      username: "alice",
      body: "Kappa",
    });
    expect(message.body).toBe("Kappa");
  });
});
