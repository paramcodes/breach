export interface Follow {
  follower_id: string;
  channel_id: string;
  created_at: string;
}

export interface ToggleFollowInput {
  followerId: string;
  channelId: string;
}

export type FollowUseCases = {
  toggleFollow: (input: ToggleFollowInput) => Promise<Follow>;
  isFollowing: (followerId: string, channelId: string) => Promise<boolean>;
  listFollowers: (channelId: string, limit?: number) => Promise<Follow[]>;
  listFollowing: (followerId: string, limit?: number) => Promise<Follow[]>;
};
