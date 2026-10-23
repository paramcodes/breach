import { encryptStreamKey } from "./encryption";
import { InMemoryStreamRepository } from "./in-memory-stream-repository";
import { createMuxLiveStream } from "./mux";
import type { StreamRepository } from "./StreamRepository";
import type {
  EndStreamInput,
  EndStreamResult,
  GoLiveInput,
  GoLiveResult,
  MuxLiveStream,
  MuxWebhookEvent,
  Stream,
  Vod,
  WatchData,
} from "./stream.types";

const defaultRepository = new InMemoryStreamRepository();

type MuxClientLike = {
  createLiveStream?: (input?: unknown) => Promise<unknown>;
  createLive?: (input?: unknown) => Promise<unknown>;
  streams?: { create?: (input?: unknown) => Promise<unknown> };
  [key: string]: unknown;
};

type GoLiveDeps = {
  repository?: StreamRepository;
  muxClient?: MuxClientLike;
  mux?: MuxClientLike;
  client?: MuxClientLike;
  encrypt?: (value: string) => string;
  encryptStreamKey?: (value: string) => string;
  now?: () => string;
  reconnectWindowMs?: number;
};

function resolveDeps(args: unknown[]): GoLiveDeps {
  const deps: GoLiveDeps = {};
  for (const arg of args) {
    if (!arg || typeof arg !== "object") {
      if (typeof arg === "function") {
        if (!deps.encrypt) deps.encrypt = arg as (value: string) => string;
        continue;
      }
      continue;
    }
    const obj = arg as Record<string, unknown>;
    if (
      typeof obj.getChannelBySlug === "function" ||
      typeof obj.createStream === "function" ||
      typeof obj.getStreamById === "function"
    ) {
      deps.repository = arg as StreamRepository;
      continue;
    }
    if (
      typeof obj.createLiveStream === "function" ||
      typeof obj.createLive === "function" ||
      (obj.streams && typeof (obj.streams as Record<string, unknown>).create === "function")
    ) {
      deps.muxClient = arg as MuxClientLike;
      continue;
    }
    Object.assign(deps, obj);
  }
  if (!deps.repository) deps.repository = defaultRepository;
  return deps;
}

function getMuxCreator(deps: GoLiveDeps): (input: unknown) => Promise<unknown> {
  const client = deps.muxClient ?? deps.mux ?? deps.client;
  if (client) {
    if (typeof client.createLiveStream === "function") {
      return client.createLiveStream.bind(client);
    }
    if (typeof client.createLive === "function") {
      return client.createLive.bind(client);
    }
    if (client.streams && typeof client.streams.create === "function") {
      return client.streams.create.bind(client.streams);
    }
  }
  return (input: unknown) => createMuxLiveStream((input ?? {}) as Record<string, unknown>);
}

function normalizeMux(result: unknown): MuxLiveStream {
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
  return {
    id,
    streamKey,
    playbackId,
    rtmpUrl,
    status: (data.status as string) ?? (root.status as string),
    assetIds: Array.isArray(data.recent_asset_ids)
      ? (data.recent_asset_ids as string[])
      : Array.isArray(data.asset_ids)
        ? (data.asset_ids as string[])
        : [],
    ...data,
    ...root,
  };
}

function getEncryptor(deps: GoLiveDeps): (value: string) => string {
  return deps.encrypt ?? deps.encryptStreamKey ?? encryptStreamKey;
}

function nowIso(deps: GoLiveDeps): string {
  return deps.now ? deps.now() : new Date().toISOString();
}

async function requireRepository(deps: GoLiveDeps): Promise<StreamRepository> {
  if (!deps.repository) deps.repository = defaultRepository;
  return deps.repository;
}

export class GoLiveUseCase {
  constructor(
    repository: StreamRepository = defaultRepository,
    muxClient?: MuxClientLike,
    encrypt?: (value: string) => string,
  ) {
    this.deps = { repository, muxClient, encrypt };
  }

  private deps: GoLiveDeps;

  async execute(input: GoLiveInput): Promise<GoLiveResult> {
    return goLiveImpl(this.deps, input);
  }

  async run(input: GoLiveInput): Promise<GoLiveResult> {
    return this.execute(input);
  }

  async goLive(input: GoLiveInput): Promise<GoLiveResult> {
    return this.execute(input);
  }
}

export class EndStreamUseCase {
  constructor(repository: StreamRepository = defaultRepository, options?: Partial<GoLiveDeps>) {
    this.deps = { repository, ...options };
  }

  private deps: GoLiveDeps;

  async execute(input: EndStreamInput): Promise<EndStreamResult> {
    return endStreamImpl(this.deps, input);
  }

  async run(input: EndStreamInput): Promise<EndStreamResult> {
    return this.execute(input);
  }

  async endStream(input: EndStreamInput): Promise<EndStreamResult> {
    return this.execute(input);
  }
}

export class HandleWebhookUseCase {
  constructor(repository: StreamRepository = defaultRepository, options?: Partial<GoLiveDeps>) {
    this.deps = { repository, ...options };
  }

  private deps: GoLiveDeps;

  async execute(
    event: MuxWebhookEvent,
  ): Promise<{ stream: Stream | null; vod: Vod | null; ignored?: boolean }> {
    return handleWebhookImpl(this.deps, event);
  }

  async run(
    event: MuxWebhookEvent,
  ): Promise<{ stream: Stream | null; vod: Vod | null; ignored?: boolean }> {
    return this.execute(event);
  }

  async handle(
    event: MuxWebhookEvent,
  ): Promise<{ stream: Stream | null; vod: Vod | null; ignored?: boolean }> {
    return this.execute(event);
  }
}

async function goLiveImpl(deps: GoLiveDeps, input: GoLiveInput): Promise<GoLiveResult> {
  const repository = await requireRepository(deps);
  if (!input?.title?.trim()) throw new Error("Title is required");
  const creator = getMuxCreator(deps);
  const muxResult = await creator({
    title: input.title.trim(),
  });
  const mux = normalizeMux(muxResult);
  const encrypt = getEncryptor(deps);
  const encrypted = encrypt(mux.streamKey);
  const stream = await repository.createStream?.({
    channelId: input.channelId,
    title: input.title.trim(),
    categoryName: input.categoryName ?? input.category ?? null,
    tags: input.tags ?? [],
    muxStreamId: mux.id,
    muxPlaybackId: mux.playbackId,
    playbackId: mux.playbackId,
    streamKeyEncrypted: encrypted,
    rtmpUrl: mux.rtmpUrl ?? "rtmps://global-live.mux.com:443/app",
    vodAssetIds: [],
    status: "idle",
  });
  if (!stream) throw new Error("Repository does not support createStream");
  return {
    stream,
    muxStream: mux,
    streamKey: mux.streamKey,
    rtmpUrl: mux.rtmpUrl ?? "rtmps://global-live.mux.com:443/app",
    playbackId: mux.playbackId,
  };
}

async function endStreamImpl(deps: GoLiveDeps, input: EndStreamInput): Promise<EndStreamResult> {
  const repository = await requireRepository(deps);
  if (!repository.getStreamById || !repository.updateStream)
    throw new Error("Repository does not support streams");
  const stream = await repository.getStreamById(input.streamId);
  if (!stream) throw new Error("Stream not found");
  const assetIds = input.assetIds ?? stream.vodAssetIds ?? [];
  const endedAt = nowIso(deps);
  const updated = await repository.updateStream(stream.id, {
    status: "ended",
    endedAt,
    vodAssetIds: assetIds,
  });
  let vod: Vod | null = null;
  if (repository.createVod) {
    vod = await repository.createVod({
      streamId: stream.id,
      channelId: stream.channelId,
      title: stream.title,
      assetIds,
      playbackId: stream.playbackId,
    });
  }
  return { stream: updated, vod };
}

async function handleWebhookImpl(
  deps: GoLiveDeps,
  event: MuxWebhookEvent,
): Promise<{ stream: Stream | null; vod: Vod | null; ignored?: boolean }> {
  const repository = await requireRepository(deps);
  const type = event?.type;
  const muxId = event?.data?.id;
  if (!muxId || !repository.getStreamByMuxId) return { stream: null, vod: null, ignored: true };
  const stream = await repository.getStreamByMuxId(muxId);
  if (!stream) return { stream: null, vod: null, ignored: true };
  if (type === "video.live_stream.active") {
    if (!repository.updateStream) return { stream, vod: null };
    const updated = await repository.updateStream(stream.id, {
      status: "live",
      startedAt: event.data?.started_at ?? nowIso(deps),
    });
    return { stream: updated, vod: null };
  }
  if (type === "video.live_stream.idle") {
    if (!repository.updateStream) return { stream, vod: null };
    const assetIds =
      event.data?.recent_asset_ids ?? event.data?.asset_ids ?? stream.vodAssetIds ?? [];
    const updated = await repository.updateStream(stream.id, {
      status: "ended",
      endedAt: event.data?.ended_at ?? nowIso(deps),
      vodAssetIds: assetIds,
    });
    let vod: Vod | null = null;
    if (repository.createVod) {
      vod = await repository.createVod({
        streamId: stream.id,
        channelId: stream.channelId,
        title: stream.title,
        assetIds,
        playbackId: stream.playbackId,
      });
    }
    return { stream: updated, vod };
  }
  return { stream, vod: null, ignored: true };
}

export function createStreamUseCases(...args: unknown[]) {
  const deps = resolveDeps(args);
  const repository = deps.repository ?? defaultRepository;
  return {
    repository,
    loadWatchData: async (slug: string): Promise<WatchData | null> => {
      const channel = await repository.getChannelBySlug(slug);
      if (!channel) return null;
      const stream = await repository.getLiveStreamByChannel(channel.id);
      return { channel, stream };
    },
    goLive: (input: GoLiveInput) => goLiveImpl(deps, input),
    endStream: (input: EndStreamInput) => endStreamImpl(deps, input),
    handleWebhook: (event: MuxWebhookEvent) => handleWebhookImpl(deps, event),
    handleMuxWebhook: (event: MuxWebhookEvent) => handleWebhookImpl(deps, event),
  };
}

export async function loadWatchData(
  slug: string,
  repository?: StreamRepository,
): Promise<WatchData | null> {
  return createStreamUseCases(repository).loadWatchData(slug);
}

export function createGoLiveUseCase(...args: unknown[]): GoLiveUseCase {
  const deps = resolveDeps(args);
  return new GoLiveUseCase(
    deps.repository,
    deps.muxClient ?? deps.mux ?? deps.client,
    deps.encrypt ?? deps.encryptStreamKey,
  );
}

export function createGoLiveUseCases(...args: unknown[]): ReturnType<typeof createStreamUseCases> {
  return createStreamUseCases(...args);
}

export function createEndStreamUseCase(...args: unknown[]): EndStreamUseCase {
  const deps = resolveDeps(args);
  return new EndStreamUseCase(deps.repository, deps);
}

export function createEndStreamUseCases(
  ...args: unknown[]
): ReturnType<typeof createStreamUseCases> {
  return createStreamUseCases(...args);
}

export function createHandleWebhookUseCase(...args: unknown[]): HandleWebhookUseCase {
  const deps = resolveDeps(args);
  return new HandleWebhookUseCase(deps.repository, deps);
}

export async function goLive(...args: unknown[]): Promise<GoLiveResult> {
  const [input, ...rest] = args as [GoLiveInput, ...unknown[]];
  const deps = resolveDeps(rest);
  return goLiveImpl(deps, input);
}

export async function endStream(...args: unknown[]): Promise<EndStreamResult> {
  const [input, ...rest] = args as [EndStreamInput, ...unknown[]];
  const deps = resolveDeps(rest);
  return endStreamImpl(deps, input);
}

export async function handleMuxWebhook(
  ...args: unknown[]
): Promise<{ stream: Stream | null; vod: Vod | null; ignored?: boolean }> {
  // Support handleMuxWebhook(event, repository?, ...) or handleMuxWebhook(repository, event, ...)
  if (args[0] && typeof args[0] === "object" && "type" in (args[0] as object)) {
    const [event, ...rest] = args as [MuxWebhookEvent, ...unknown[]];
    const deps = resolveDeps(rest);
    return handleWebhookImpl(deps, event);
  }
  const [first, second, ...rest] = args;
  const deps = resolveDeps([first, ...rest]);
  return handleWebhookImpl(deps, second as MuxWebhookEvent);
}

export const handleWebhook = handleMuxWebhook;

// Re-export encryption and mux helpers for convenience.
export { decryptStreamKey, encryptStreamKey } from "./encryption";
export { createMuxClient, createMuxLiveStream } from "./mux";
