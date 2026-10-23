"use client";

import { useEffect, useState } from "react";

export function useFollowAnalytics(_channelId: string) {
  const [viewCount, setViewCount] = useState(0);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    // Fetch follower count from server
  }, []);

  return {
    viewCount,
    setViewCount,
    tooltipOpen,
    setTooltipOpen,
  };
}

export function FollowerTooltip({ channelId }: { channelId: string }) {
  const { viewCount, tooltipOpen, setTooltipOpen } = useFollowAnalytics(channelId);
  const [followerCount, _setFollowerCount] = useState(0);

  useEffect(() => {
    // Fetch actual follower count
  }, []);

  return (
    <div>
      <button
        onClick={() => setTooltipOpen(!tooltipOpen)}
        className="relative inline-flex items-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white"
        aria-label="Followers"
      >
        Followers
        <span className="ml-1">{viewCount}</span>
      </button>

      {tooltipOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-box shadow-lg bg-white p-6 border border-border max-h-80 overflow-y-auto">
          <p className="text-sm font-medium">Followers</p>
          <p className="mt-2 text-lg">{followerCount} followers</p>
          <button
            onClick={() => setTooltipOpen(false)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-input px-3 py-1.5 text-sm font-medium accent-contrast"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
