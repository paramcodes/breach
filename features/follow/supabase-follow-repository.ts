import type { Follow, FollowRepository } from "./repository";

export class SupabaseFollowRepository implements FollowRepository {
  // Constructor removed - no dependencies

  async toggleFollow({
    followerId,
    channelId,
  }: {
    followerId: string;
    channelId: string;
  }): Promise<Follow> {
    // Simulate: check if following, then toggle
    const isFollowing = await this.isFollowing(followerId, channelId);

    if (isFollowing) {
      // Unfollow
      return {
        follower_id: followerId,
        channel_id: channelId,
        created_at: new Date().toISOString(),
      };
    } else {
      // Follow
      return {
        follower_id: followerId,
        channel_id: channelId,
        created_at: new Date().toISOString(),
      };
    }
  }

  async isFollowing(_followerId: string, _channelId: string): Promise<boolean> {
    // Mock implementation - in real app, query the database
    return false;
  }

  async listFollowers(_channelId: string, _limit = 10): Promise<Follow[]> {
    // Mock implementation
    return [];
  }

  async listFollowing(_followerId: string, _limit = 10): Promise<Follow[]> {
    // Mock implementation
    return [];
  }
}
