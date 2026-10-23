import type { Notification, NotificationUseCases } from "./notifications.types";

export class InMemoryNotificationRepository implements NotificationUseCases {
  private readonly notifications = new Map<string, Notification[]>(); // userId/channelId -> notifications

  async markAsRead(notificationId: string): Promise<void> {
    for (const [key, entries] of this.notifications.entries()) {
      const updated = entries.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      this.notifications.set(key, updated);
    }
  }

  async listUnread(userId: string): Promise<Notification[]> {
    const entries = this.notifications.get(userId) ?? [];
    return entries.filter((n) => !n.read);
  }

  async triggerChannelFollow(followerId: string, channelId: string): Promise<void> {
    const notification: Notification = {
      id: `${channelId}:follow:${Date.now()}`,
      user_id: channelId,
      type: "channel_followed",
      related_entity_id: channelId,
      related_entity_type: "channel",
      message: `${followerId} started following your channel`,
      read: false,
      created_at: new Date().toISOString(),
    };

    if (!this.notifications.has(channelId)) {
      this.notifications.set(channelId, []);
    }
    this.notifications.get(channelId)?.push(notification);
  }

  async triggerChannelLive(channelId: string): Promise<void> {
    const notification: Notification = {
      id: `${channelId}:live:${Date.now()}`,
      user_id: channelId,
      type: "channel_live",
      related_entity_id: channelId,
      related_entity_type: "channel",
      message: "Your stream is now live!",
      read: false,
      created_at: new Date().toISOString(),
    };

    if (!this.notifications.has(channelId)) {
      this.notifications.set(channelId, []);
    }
    this.notifications.get(channelId)?.push(notification);
  }
}

export const notificationUseCases: NotificationUseCases = new InMemoryNotificationRepository();
