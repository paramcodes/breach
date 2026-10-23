import type { WatchChannel, WatchStream } from "./stream.types";

/**
 * Read port for the watch surface. The in-memory adapter backs the demo today;
 * a Supabase-backed adapter arrives with the full stream slice.
 */
export interface StreamRepository {
  getChannelBySlug(slug: string): Promise<WatchChannel | null>;
  getLiveStreamByChannel(channelId: string): Promise<WatchStream | null>;
}
