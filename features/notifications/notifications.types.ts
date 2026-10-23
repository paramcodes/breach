export interface Notification {
  id: string;
  user_id: string;
  type: "channel_followed" | "channel_live" | "channel_unfollowed";
  related_entity_id: string; // channel_id
  related_entity_type: "channel";
  message: string;
  read: boolean;
  created_at: string;
}

export interface NotificationUseCases {
  markAsRead: (notificationId: string) => Promise<void>;
  listUnread: (userId: string) => Promise<Notification[]>;
  triggerChannelFollow: (followerId: string, channelId: string) => Promise<void>;
  triggerChannelLive: (channelId: string) => Promise<void>;
}
