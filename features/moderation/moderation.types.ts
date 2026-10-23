export type ChatUserId = string;
export type ChatChannelId = string;
export type ModActionId = string;

export interface Ban {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  reason?: string | null;
  durationMs?: number | null; // null = permanent
  createdAt: string;
  expiresAt?: string | null; // null = permanent
}

export interface Timeout {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  reason?: string;
  durationMs: number;
  createdAt: string;
  expiresAt: string;
}

export interface ModAction {
  id: string;
  channelId: string;
  adminUserId: string;
  targetUserId: string;
  action: "ban" | "delete_message" | "timeout" | "unban" | "untimeout";
  messageId?: string;
  reason?: string;
  createdAt: string;
}

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

export interface BanUserInput {
  channelId: string;
  userId: string;
  username: string;
  reason?: string;
  durationMs?: number; // null = permanent
}

export interface TimeoutUserInput {
  channelId: string;
  userId: string;
  username: string;
  durationMs: number;
  reason?: string;
}

export interface UnbanInput {
  channelId: string;
  userId: string;
}

export interface ModerationSettings {
  slowMode: boolean;
  slowModeSeconds: number;
  emoteOnly: boolean;
}