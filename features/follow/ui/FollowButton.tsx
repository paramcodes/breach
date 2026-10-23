"use client";

import { useEffect, useState } from "react";
import { InMemoryFollowRepository } from "@/features/follow/in-memory-repository";

function getCurrentUserId(): string | null {
  // In a real app, this would come from Supabase auth
  return "current-user";
}

export function useToggleFollow(channelId: string) {
  const repo = new InMemoryFollowRepository();
  const [isToggling, setIsToggling] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const toggle = async () => {
    setIsToggling(true);
    try {
      const followerId = getCurrentUserId();
      if (!followerId) return;

      const follow = await repo.toggleFollow({ followerId, channelId });
      const following = await repo.isFollowing(followerId, channelId);
      setIsFollowing(following);
      return follow;
    } finally {
      setIsToggling(false);
    }
  };

  return { toggle, isFollowing, isToggling, isPending: isToggling };
}

export function FollowButton({ channelId }: { channelId: string }) {
  const { toggle, isFollowing, isToggling } = useToggleFollow(channelId);
  const userId = getCurrentUserId();

  if (!userId) {
    return (
      <button type="button" className="hidden sm:block" disabled>
        Follow
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      type="button"
      className={`
        inline-flex items-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${isFollowing ? "bg-secondary text-secondary-foreground" : "bg-primary"}
        ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      disabled={isToggling}
    >
      {isFollowing ? "Following" : "Follow"}
      {isToggling && (
        <span className="ml-2 animate-spin h-4 w-4 border-2 border-white rounded-full"></span>
      )}
    </button>
  );
}

export function FollowerCount({ channelId }: { channelId: string }) {
  const [followers, setFollowers] = useState<Array<{ follower_id: string; created_at: string }>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const repo = new InMemoryFollowRepository();
    repo
      .listFollowers(channelId, 10)
      .then(setFollowers)
      .finally(() => setIsLoading(false));
  }, [channelId]);

  if (isLoading) return <span className="text-muted-foreground">Loading...</span>;

  const count = followers.length;

  return <span className="text-sm text-muted-foreground">{count} followed</span>;
}

export function FollowingList({ userId }: { userId: string }) {
  const [following, setFollowing] = useState<
    Array<{ follower_id: string; channel_id: string; created_at: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const repo = new InMemoryFollowRepository();
    repo
      .listFollowing(userId, 10)
      .then(setFollowing)
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) return <p>Loading following list...</p>;

  if (!following || following.length === 0) {
    return <p className="text-muted-foreground">Not following anyone yet.</p>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {following.map((follow) => (
        <li key={follow.channel_id} className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary" />
          <span>{follow.channel_id.substring(0, 8)}...</span>
        </li>
      ))}
    </ul>
  );
}
