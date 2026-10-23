import type { Follow } from "./repository";

export class InMemoryFollowRepository {
  private readonly follows = new Map<string, Set<string>>(); // followerId -> Set of channelIds

  async toggleFollow({ followerId, channelId }: { followerId: string; channelId: string }) {
    const followerSet = this.follows.get(followerId) ?? new Set();
    const isCurrentlyFollowing = followerSet.has(channelId);

    if (isCurrentlyFollowing) {
      followerSet.delete(channelId);
      this.follows.set(followerId, followerSet);
    } else {
      followerSet.add(channelId);
      this.follows.set(followerId, followerSet);
    }

    return {
      follower_id: followerId,
      channel_id: channelId,
      created_at: new Date().toISOString(),
    };
  }

  async isFollowing(followerId: string, channelId: string): Promise<boolean> {
    const followerSet = this.follows.get(followerId);
    return !!followerSet?.has(channelId);
  }

  async listFollowers(channelId: string, limit = 10): Promise<Follow[]> {
    const followers: { follower_id: string; created_at: string }[] = [];
    for (const [fId, channels] of this.follows.entries()) {
      if (channels.has(channelId)) {
        followers.push({ follower_id: fId, created_at: new Date().toISOString() });
      }
    }
    return followers
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map((f) => ({
        follower_id: f.follower_id,
        channel_id: channelId,
        created_at: f.created_at,
      }));
  }

  async listFollowing(followerId: string, limit = 10): Promise<Follow[]> {
    const channels = this.follows.get(followerId) || new Set();
    const now = new Date().toISOString();
    return Array.from(channels)
      .slice(0, limit)
      .map((channelId) => ({
        follower_id: followerId,
        channel_id: channelId,
        created_at: now,
      }));
  }
}
