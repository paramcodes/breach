import type { Follow } from "./repository";

export type { Follow };

export const toggleFollowImpl = async (
  repo: {
    toggleFollow: (input: { followerId: string; channelId: string }) => Promise<Follow>;
    isFollowing: (followerId: string, channelId: string) => Promise<boolean>;
  },
  input: { followerId: string; channelId: string },
): Promise<Follow> => {
  const follow = await repo.toggleFollow(input);
  return follow;
};

export const createFollowUseCases = (repo: {
  toggleFollow: (input: { followerId: string; channelId: string }) => Promise<Follow>;
  isFollowing: (followerId: string, channelId: string) => Promise<boolean>;
  listFollowers: (channelId: string, limit?: number) => Promise<Follow[]>;
  listFollowing: (followerId: string, limit?: number) => Promise<Follow[]>;
}) => ({
  toggleFollow: async (input: { followerId: string; channelId: string }) =>
    await toggleFollowImpl(repo, input),
  isFollowing: async (followerId: string, channelId: string) =>
    await repo.isFollowing(followerId, channelId),
  listFollowers: async (channelId: string, limit = 10) =>
    await repo.listFollowers(channelId, limit),
  listFollowing: async (followerId: string, limit = 10) =>
    await repo.listFollowing(followerId, limit),
});
