import type { Metadata } from "next";

import { loadWatchData, WatchPage } from "@/features/stream";

type WatchRouteProps = {
  params: Promise<{ channel: string }>;
};

export async function generateMetadata({ params }: WatchRouteProps): Promise<Metadata> {
  const { channel } = await params;
  return {
    title: `${channel} - Watch | Twitch Clone`,
    description: `Watch ${channel} live on Twitch Clone.`,
  };
}

export default async function WatchRoute({ params }: WatchRouteProps) {
  const { channel } = await params;
  const data = await loadWatchData(channel);
  return <WatchPage channel={channel} initialData={data} />;
}
