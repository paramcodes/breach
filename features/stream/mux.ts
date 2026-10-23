export interface MuxLiveStreamCreateInput {
  title?: string;
  playback_policy?: string[];
  [key: string]: unknown;
}

export interface MuxCreatedLiveStream {
  id: string;
  streamKey: string;
  playbackId: string | null;
  rtmpUrl: string;
  [key: string]: unknown;
}

function normalizeCreated(result: unknown): MuxCreatedLiveStream {
  const root = (result ?? {}) as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const playbackIds = Array.isArray(data.playback_ids)
    ? (data.playback_ids as Array<Record<string, unknown>>)
    : [];
  const id = String(data.id ?? root.id ?? "");
  const streamKey = String(
    data.stream_key ?? data.streamKey ?? root.stream_key ?? root.streamKey ?? "",
  );
  const playbackId =
    playbackIds[0]?.id != null
      ? String(playbackIds[0].id)
      : data.playback_id != null
        ? String(data.playback_id)
        : data.playbackId != null
          ? String(data.playbackId)
          : null;
  const rtmpUrl = String(
    data.rtmp_url ??
      data.rtmpUrl ??
      root.rtmp_url ??
      root.rtmpUrl ??
      "rtmps://global-live.mux.com:443/app",
  );
  return { id, streamKey, playbackId, rtmpUrl };
}

export async function createMuxLiveStream(
  input: MuxLiveStreamCreateInput = {},
  config: { tokenId?: string; tokenSecret?: string; baseUrl?: string } = {},
): Promise<MuxCreatedLiveStream> {
  const tokenId = config.tokenId ?? process.env.MUX_TOKEN_ID;
  const tokenSecret = config.tokenSecret ?? process.env.MUX_TOKEN_SECRET;
  const baseUrl = config.baseUrl ?? "https://api.mux.com";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (tokenId && tokenSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
  }
  const response = await fetch(`${baseUrl}/video/v1/live-streams`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      playback_policy: ["public"],
      ...input,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Mux request failed: ${response.status}`);
  }
  const json = await response.json();
  return normalizeCreated(json);
}

export function createMuxClient(config?: {
  tokenId?: string;
  tokenSecret?: string;
  baseUrl?: string;
}): { createLiveStream: (input?: MuxLiveStreamCreateInput) => Promise<MuxCreatedLiveStream> } {
  return {
    createLiveStream: (input = {}) => createMuxLiveStream(input, config),
  };
}
