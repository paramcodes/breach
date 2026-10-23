import { logger } from "@/shared/lib/logger";
import type { ChatRepository } from "./ChatRepository";
import type {
  ChatMessage,
  ChatSettings,
  CreateChatMessageInput,
  EmoteStatus,
} from "./chat.types";
import { DEFAULT_CHAT_SETTINGS } from "./chat.types";
import { isEmoteOnlyBody } from "./emotes";
import { InMemoryChatRepository } from "./in-memory-chat-repository";
import { canSendInSlowMode, createRateLimiter, type RateLimiter } from "./rate-limit";
import type { ChatTransport } from "./realtime";
import { InMemoryChatTransport } from "./realtime";
import type { Ban, Timeout } from "../moderation/moderation.types";
import { InMemoryModerationRepository } from "../moderation/in-memory-moderation-repository";

export const MAX_MESSAGE_LENGTH = 500;

export type ChatSendErrorReason =
  | "empty"
  | "too-long"
  | "rate-limited"
  | "slow-mode"
  | "emote-only";

export class ChatSendError extends Error {
  readonly reason: ChatSendErrorReason;
  readonly retryAfterMs: number;

  constructor(reason: ChatSendErrorReason, message: string, retryAfterMs = 0) {
    super(message);
    this.name = "ChatSendError";
    this.reason = reason;
    this.retryAfterMs = retryAfterMs;
  }
}

export type ChatDeps = {
  repository?: ChatRepository;
  transport?: ChatTransport;
  rateLimiter?: RateLimiter;
  now?: () => number;
};

interface ChatContext {
  repository: ChatRepository;
  transport: ChatTransport;
  rateLimiter: RateLimiter;
  now: () => number;
  lastSentAt: Map<string, number>;
}

function resolveContext(deps?: ChatDeps | ChatRepository): ChatContext {
  if (deps && typeof (deps as ChatRepository).listMessages === "function") {
    return {
      repository: deps as ChatRepository,
      transport: new InMemoryChatTransport(),
      rateLimiter: createRateLimiter(),
      now: () => Date.now(),
      lastSentAt: new Map(),
    };
  }
  const resolved = (deps ?? {}) as ChatDeps;
  return {
    repository: resolved.repository ?? new InMemoryChatRepository(),
    transport: resolved.transport ?? new InMemoryChatTransport(),
    rateLimiter: resolved.rateLimiter ?? createRateLimiter(),
    now: resolved.now ?? (() => Date.now()),
    lastSentAt: new Map(),
  };
}

export async function sendMessageImpl(
  context: ChatContext,
  input: CreateChatMessageInput,
): Promise<ChatMessage> {
  // Moderation checks: ban and timeout
  const modRepo = new InMemoryModerationRepository();
  const banned = await modRepo.isUserBanned(input.channelId, input.userId);
  if (banned) {
    throw new Error(`User ${input.username} is banned from this channel`);
  }

  const timedOut = await modRepo.isUserTimedOut(input.channelId, input.userId);
  if (timedOut) {
    const expiry = new Date(timedOut.expiresAt).getTime();
    if (Date.now() < expiry) {
      const remaining = Math.ceil((expiry - Date.now()) / 1000);
      throw new Error(`User ${input.username} is timed out. Please wait ${remaining} seconds.`);
    }
    // Timeout expired, allow the message
  }

  const body = input.body.trim();
  if (!body) throw new ChatSendError("empty", "Message cannot be empty");

  const settings = await context.repository.getChatSettings(input.channelId);
  if (body.length > settings.maxMessageLength) {
    throw new ChatSendError("too-long", `Message exceeds ${settings.maxMessageLength} characters`);
  }

  const now = context.now();
  const rate = context.rateLimiter.check(input.userId, now);
  if (!rate.allowed) {
    throw new ChatSendError(
      "rate-limited",
      "You are sending messages too quickly. Try again soon.",
      rate.retryAfterMs,
    );
  }

  if (settings.slowMode) {
    const lastSentAt = context.lastSentAt.get(input.userId) ?? null;
    if (!canSendInSlowMode(lastSentAt, settings.slowModeSeconds, now)) {
      const waitMs = Math.max(0, settings.slowModeSeconds * 1000 - (now - (lastSentAt ?? 0)));
      throw new ChatSendError(
        "slow-mode",
        `Slow mode is on. Wait ${Math.ceil(waitMs / 1000)} seconds.`,
        waitMs,
      );
    }
  }

  if (settings.emoteOnly) {
    const emotes = await context.repository.listEmotes(input.channelId, "approved");
    if (!isEmoteOnlyBody(body, emotes)) {
      throw new ChatSendError("emote-only", "Emote-only mode is on. Messages must be emotes only.");
    }
  }

  const message = await context.repository.createMessage({
    channelId: input.channelId,
    userId: input.userId,
    username: input.username,
    body,
  });

  context.rateLimiter.record(input.userId, now);
  context.lastSentAt.set(input.userId, now);

  try {
    await context.transport.broadcastMessage(input.channelId, message);
  } catch (cause: unknown) {
    logger.warn("chat: failed to broadcast message", cause);
  }

  return message;
}

export async function deleteMessageImpl(
  context: ChatContext,
  channelId: string,
  messageId: string,
): Promise<void> {
  await context.repository.deleteMessage(messageId);
  try {
    await context.transport.broadcastDelete(channelId, messageId);
  } catch (cause: unknown) {
    logger.warn("chat: failed to broadcast delete", cause);
  }
}

export async function updateChatSettingsImpl(
  context: ChatContext,
  channelId: string,
  patch: Partial<ChatSettings>,
): Promise<ChatSettings> {
  const current = await context.repository.getChatSettings(channelId);
  const merged: ChatSettings = { ...DEFAULT_CHAT_SETTINGS, ...current, ...patch };
  merged.slowModeSeconds = Math.max(0, Math.floor(merged.slowModeSeconds));
  merged.maxMessageLength = Math.min(MAX_MESSAGE_LENGTH, Math.max(1, merged.maxMessageLength));
  const saved = await context.repository.updateChatSettings(channelId, merged);
  try {
    await context.transport.broadcastSettings(channelId, saved);
  } catch (cause: unknown) {
    logger.warn("chat: failed to broadcast settings", cause);
  }
  return saved;
}

export function createChatUseCases(deps?: ChatDeps | ChatRepository) {
  const context = resolveContext(deps);
  return {
    repository: context.repository,
    transport: context.transport,
    rateLimiter: context.rateLimiter,
    sendMessage: (input: CreateChatMessageInput) => sendMessageImpl(context, input),
    deleteMessage: (channelId: string, messageId: string) =>
      deleteMessageImpl(context, channelId, messageId),
    listMessages: (channelId: string, limit?: number) =>
      context.repository.listMessages(channelId, limit),
    listEmotes: (channelId: string, status?: EmoteStatus) =>
      context.repository.listEmotes(channelId, status),
    getChatSettings: (channelId: string) => context.repository.getChatSettings(channelId),
    updateChatSettings: (channelId: string, patch: Partial<ChatSettings>) =>
      updateChatSettingsImpl(context, channelId, patch),
  };
}

export type ChatUseCases = ReturnType<typeof createChatUseCases>;