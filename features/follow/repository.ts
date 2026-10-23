export interface Follow {
  follower_id: string;
  channel_id: string;
  created_at: string;
}

export interface FollowRepository {
  toggleFollow(input: { followerId: string; channelId: string }): Promise<Follow>;
  isFollowing(followerId: string, channelId: string): Promise<boolean>;
  listFollowers(channelId: string, limit?: number): Promise<Follow[]>;
  listFollowing(followerId: string, limit?: number): Promise<Follow[]>;
}
