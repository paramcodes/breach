import { test, expect } from "bun:test";
import {
  createModerationUseCases,
  type Ban,
  type Timeout,
  type ModActionLogEntry,
} from "../moderation-use-cases";
import { InMemoryModerationRepository } from "../in-memory-moderation-repository";

test("ban user", async () => {
  const modUseCases = createModerationUseCases();
  const ban = await modUseCases.banUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
    reason: "spamming",
  });

  expect(ban).toMatchObject({
    id: expect.any(String),
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
    reason: "spamming",
    durationMs: null,
    createdAt: expect.any(String),
    expiresAt: null,
  });
});

test("ban user with duration", async () => {
  const modUseCases = createModerationUseCases();
  const durationMs = 60_000; // 1 minute
  const ban = await modUseCases.banUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
    durationMs,
  });

  expect(ban).toMatchObject({
    durationMs,
    expiresAt: expect.any(String),
  });
});

test("unban user", async () => {
  const modUseCases = createModerationUseCases();
  await modUseCases.banUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
  });
  await modUseCases.unbanUser({ channelId: "chan-1", userId: "user-1" });

  const unbanned = await modUseCases.isUserBanned("chan-1", "user-1");
  expect(unbanned).toBeNull();
});

test("timeout user", async () => {
  const modUseCases = createModerationUseCases();
  const durationMs = 30_000; // 30 seconds
  const timeout = await modUseCases.timeoutUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
    durationMs,
    reason: "misbehaving",
  });

  expect(timeout).toMatchObject({
    id: expect.any(String),
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
    reason: "misbehaving",
    durationMs,
    createdAt: expect.any(String),
    expiresAt: expect.any(String),
  });
});

test("untimeout user", async () => {
  const modUseCases = createModerationUseCases();
  await modUseCases.timeoutUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
    durationMs: 30_000,
  });
  await modUseCases.untimeoutUser({ channelId: "chan-1", userId: "user-1" });

  const untimeouted = await modUseCases.isUserTimedOut("chan-1", "user-1");
  expect(untimeouted).toBeNull();
});

test("isUserTimedOut returns null when not timed out", async () => {
  const modUseCases = createModerationUseCases();
  const result = await modUseCases.isUserTimedOut("chan-1", "user-1");
  expect(result).toBeNull();
});

test("isUserBanned returns null when not banned", async () => {
  const modUseCases = createModerationUseCases();
  const result = await modUseCases.isUserBanned("chan-1", "user-1");
  expect(result).toBeNull();
});

test("listModActions", async () => {
  const modUseCases = createModerationUseCases();
  await modUseCases.banUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "testuser",
  });
  await modUseCases.timeoutUser({
    channelId: "chan-1",
    userId: "user-2",
    username: "testuser2",
    durationMs: 60_000,
  });

  const actions = await modUseCases.listModActions("chan-1");
  expect(actions.length).toBeGreaterThanOrEqual(2);
});

test("send message with banned user fails", async () => {
  const modUseCases = createModerationUseCases();
  await modUseCases.banUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "banneduser",
  });

  const result = await modUseCases.sendMessage("chan-1", {
    userId: "user-1",
    username: "banneduser",
    body: "hello",
  });
  expect(result.success).toBe(false);
  expect(result.error).toBe("User banneduser is banned from this channel");
});

test("send message with timed out user fails", async () => {
  const modUseCases = createModerationUseCases();
  await modUseCases.timeoutUser({
    channelId: "chan-1",
    userId: "user-1",
    username: "timedoutuser",
    durationMs: 3_000, // 3 seconds
  });

  // Should fail while timed out
  const result = await modUseCases.sendMessage("chan-1", {
    userId: "user-1",
    username: "timedoutuser",
    body: "hello",
  });
  expect(result.success).toBe(false);
  expect(result.error).toContain("timed out");

  // Wait for timeout to expire (3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 4_000));

  // Should succeed after timeout expires
  const successResult = await modUseCases.sendMessage("chan-1", {
    userId: "user-1",
    username: "timedoutuser",
    body: "hello",
  });
  expect(successResult.success).toBe(true);
});

test("send message allowed for normal user", async () => {
  const modUseCases = createModerationUseCases();
  const result = await modUseCases.sendMessage("chan-1", {
    userId: "user-1",
    username: "normaluser",
    body: "hello",
  });
  expect(result.success).toBe(true);
  expect(result.message).toBe("Message sent successfully");
});