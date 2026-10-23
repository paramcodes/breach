import { InMemoryModerationRepository } from "./in-memory-moderation-repository";
import type {
  Ban,
  Timeout,
  ModerationSettings,
  BanUserInput,
  TimeoutUserInput,
  UnbanInput,
} from "./moderation.types";

export type { Ban, Timeout, ModerationSettings } from "./moderation.types";

export interface ModActionLogEntry {
  id: string;
  channelId: string;
  adminUserId: string;
  targetUserId: string;
  action: "ban" | "delete_message" | "timeout" | "unban" | "untimeout";
  reason?: string;
  messageId?: string;
  createdAt: string;
}

/** Moderation use cases with in-memory repository */
export class ModerationUseCases {
  private readonly repo: InMemoryModerationRepository;

  constructor() {
    this.repo = new InMemoryModerationRepository();
  }

  async banUser(input: BanUserInput): Promise<Ban> {
    return this.repo.banUser(input);
  }

  async timeoutUser(input: TimeoutUserInput): Promise<Timeout> {
    return this.repo.timeoutUser(input);
  }

  async unbanUser(input: UnbanInput): Promise<void> {
    return this.repo.unbanUser(input);
  }

  async untimeoutUser(input: UnbanInput): Promise<void> {
    return this.repo.untimeoutUser(input);
  }

  async isUserBanned(channelId: string, userId: string): Promise<Ban | null> {
    return this.repo.isUserBanned(channelId, userId);
  }

  async isUserTimedOut(channelId: string, userId: string): Promise<Timeout | null> {
    return this.repo.isUserTimedOut(channelId, userId);
  }

  async listModActions(channelId: string, targetUserId?: string): Promise<ModActionLogEntry[]> {
    return this.repo.listModActions(channelId, targetUserId);
  }

  async getModerationSettings(channelId: string): Promise<ModerationSettings> {
    return this.repo.getModerationSettings(channelId);
  }

  async updateModerationSettings(channelId: string, patch: Partial<ModerationSettings>): Promise<ModerationSettings> {
    return this.repo.updateModerationSettings(channelId, patch);
  }

  async sendMessage(
    channelId: string,
    input: {
      userId: string;
      username: string;
      body: string;
    },
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    // Check if user is banned
    const banned = await this.repo.isUserBanned(channelId, input.userId);
    if (banned) {
      return { success: false, error: `User ${input.username} is banned from this channel` };
    }

    // Check if user is timed out
    const timedOut = await this.repo.isUserTimedOut(channelId, input.userId);
    if (timedOut) {
      const expiry = new Date(timedOut.expiresAt).getTime();
      if (Date.now() < expiry) {
        const remaining = Math.ceil((expiry - Date.now()) / 1000);
        return {
          success: false,
          error: `User ${input.username} is timed out. Please wait ${remaining} seconds.`,
        };
      }
      // Timeout expired, allow the message
      await this.repo.untimeoutUser({ channelId, userId: input.userId });
    }

    return { success: true, message: "Message sent successfully" };
  }
}

/** Factory function for convenience */
export function createModerationUseCases() {
  return new ModerationUseCases();
}