"use client";

import { useEffect, useState } from "react";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: string;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    // Load unread notifications on mount
    const loadNotifications = async () => {
      // In a real app, this would call a notification repository
      setNotifications([]);
      setUnreadCount(0);
    };

    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    // Mark notification as read
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const _handleChannelFollow = async (followerId: string, channelId: string) => {
    // Trigger follow notification
    setUnreadCount((prev) => prev + 1);
    setNotifications((prev) => [
      {
        id: `${channelId}:follow:${Date.now()}`,
        message: `${followerId} started following your channel`,
        type: "channel_followed",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const _handleChannelLive = async (channelId: string) => {
    // Trigger live notification
    setUnreadCount((prev) => prev + 1);
    setNotifications((prev) => [
      {
        id: `${channelId}:live:${Date.now()}`,
        message: "Your stream is now live!",
        type: "channel_live",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => {
          /* toggle dropdown */
        }}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <title>Notifications</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.8m0 4h.9m-4.2-4.9C6.9 5.9 3 10.8 3 14.5S6.9 23 10.8 22.1C7.8 21.5 8 20.7 8 12Zm8-8h-8m4 0a4 4 0 014 4v4m0-8a4 4 0 01-4 4v4m-4-4h8m-4-4v8M7 7h.01M7 3h.01M3 7h.01M7 23h.01M7 21h.01M3 13h.01M7 13h.01M3 19h.01M7 19h.01Z"
          />
        </svg>
        <span className="hidden sm:inline-flex items-center rounded-full bg-red-500 text-xs text-white w-5 h-5">
          {unreadCount}
        </span>
      </button>

      {unreadCount > 0 && (
        <div className="absolute right-0 mt-2 w-56 rounded-box shadow-lg bg-white p-6 border border-border max-h-80 overflow-y-auto">
          <p className="text-sm font-medium mb-3">Notifications</p>
          {notifications.length === 0 && (
            <p className="text-muted-foreground text-xs pb-2">No new notifications</p>
          )}
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-3 rounded-box px-py py-2 border-b last:border-0"
            >
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor">
                  <title>Notification icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.8m0 4h.9m-4.2-4.9C6.9 5.9 3 10.8 3 14.5S6.9 23 10.8 22.1C7.8 21.5 8 20.7 8 12Zm8-8h-8m4 0a4 4 0 014 4v4m0-8a4 4 0 01-4 4v4m-4-4h8m-4-4v8M7 7h.01M7 3h.01M3 7h.01M7 23h.01M7 21h.01M3 13h.01M7 13h.01M3 19h.01M7 19h.01Z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{notif.message}</p>
                <p className="text-xs text-muted-foreground truncate">{notif.created_at}</p>
              </div>
              <button
                type="button"
                onClick={() => markAsRead(notif.id)}
                className="ml-2 text-primary underline text-sm hover:text-primary/90"
                aria-label="Mark as read"
              >
                ✓
              </button>
            </div>
          ))}
          {notifications.length > 0 ? (
            <div className="mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  /* mark all read */
                }}
                className="w-full text-primary underline text-sm"
                aria-label="Mark all as read"
              >
                Mark all as read
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
