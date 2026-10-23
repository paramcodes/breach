import type {
  Ban,
  BanUserInput,
  ModActionLogEntry,
  ModerationSettings,
  Timeout,
  TimeoutUserInput,
  UnbanInput,
} from "./moderation.types";

export class InMemoryModerationRepository {
  private readonly bans = new Map<string, Ban>(); // key: "channelId-userId"
  private readonly timeouts = new Map<string, Timeout>(); // key: "channelId-userId"
  private readonly actions: ModActionLogEntry[] = []; // action log history
  private actionCounter = 0;

  private nextId(prefix: string): string {
    this.actionCounter += 1;
    return `${prefix}-${this.actionCounter}`;
  }

  async banUser(input: BanUserInput): Promise<Ban> {
    const id = this.nextId("ban");
    const now = new Date().toISOString();
    const duration = input.durationMs ?? null;
    const expiresAt = duration !== null ? new Date(Date.now() + duration).toISOString() : null;

    const ban: Ban = {
      id,
      channelId: input.channelId,
      userId: input.userId,
      username: input.username,
      reason: input.reason,
      durationMs: duration,
      createdAt: now,
      expiresAt,
    };

    this.bans.set(`${input.channelId}-${input.userId}`, ban);

    // Record mod action log entry
    const actionEntry: ModActionLogEntry = {
      id: this.nextId("action"),
      channelId: input.channelId,
      adminUserId: "moderator", // In a real app, this would be the admin user ID
      targetUserId: input.userId,
      action: "ban",
      reason: input.reason,
      messageId: undefined,
      createdAt: now,
    };
    this.actions.push(actionEntry);

    return ban;
  }

  async unbanUser(input: UnbanInput): Promise<void> {
    this.bans.delete(`${input.channelId}-${input.userId}`);
  }

  async isUserBanned(channelId: string, userId: string): Promise<Ban | null> {
    return this.bans.get(`${channelId}-${userId}`) ?? null;
  }

  async timeoutUser(input: TimeoutUserInput): Promise<Timeout> {
    const id = this.nextId("timeout");
    const now = new Date().toISOString();
    const duration = input.durationMs;
    const expiresAt = new Date(Date.now() + duration).toISOString();

    const timeout: Timeout = {
      id,
      channelId: input.channelId,
      userId: input.userId,
      username: input.username,
      reason: input.reason,
      durationMs: duration,
      createdAt: now,
      expiresAt,
    };

    this.timeouts.set(`${input.channelId}-${input.userId}`, timeout);

    // Record mod action log entry
    const actionEntry: ModActionLogEntry = {
      id: this.nextId("action"),
      channelId: input.channelId,
      adminUserId: "moderator",
      targetUserId: input.userId,
      action: "timeout",
      reason: input.reason,
      messageId: undefined,
      createdAt: now,
    };
    this.actions.push(actionEntry);

    return timeout;
  }

  async untimeoutUser(input: UnbanInput): Promise<void> {
    this.timeouts.delete(`${input.channelId}-${input.userId}`);
  }

  async isUserTimedOut(channelId: string, userId: string): Promise<Timeout | null> {
    return this.timeouts.get(`${channelId}-${userId}`) ?? null;
  }

  async listModActions(channelId: string, targetUserId?: string): Promise<ModActionLogEntry[]> {
    return this.actions
      .filter(
        (a) => a.channelId === channelId && (!targetUserId || a.targetUserId === targetUserId),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async recordModAction(
    action: Omit<ModActionLogEntry, "id" | "createdAt">,
  ): Promise<ModActionLogEntry> {
    const id = this.nextId("action");
    const entry: ModActionLogEntry = { ...action, id, createdAt: new Date().toISOString() };
    this.actions.push(entry);
    return entry;
  }

  async getModerationSettings(_channelId: string): Promise<ModerationSettings> {
    // Return default settings if none configured
    return { slowMode: false, slowModeSeconds: 5, emoteOnly: false };
  }

  async updateModerationSettings(
    _channelId: string,
    _patch: Partial<ModerationSettings>,
  ): Promise<ModerationSettings> {
    // For now, just return defaults; Supabase integration can be added later
    return this.getModerationSettings(_channelId);
  }
}
