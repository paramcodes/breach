import { describe, expect, it, vi } from "vitest";

import { InMemoryStreamRepository } from "../in-memory-stream-repository";
import { createStreamUseCases, decryptStreamKey } from "../use-cases";

describe("GoLive and EndStream", () => {
  it("creates a Mux live stream and stores key encrypted", async () => {
    const repo = new InMemoryStreamRepository();
    const mux = {
      createLiveStream: vi.fn().mockResolvedValue({
        data: {
          id: "mux-1",
          stream_key: "secret-key",
          playback_ids: [{ id: "play-1" }],
        },
      }),
    };
    const useCases = createStreamUseCases(repo, mux);
    const result = await useCases.goLive({
      channelId: "ch1",
      title: "My Stream",
      category: "Gaming",
      tags: ["English"],
    });
    expect(result.streamKey).toBe("secret-key");
    expect(result.playbackId).toBe("play-1");
    const stored = await repo.getStreamById(result.stream.id);
    expect(stored?.streamKeyEncrypted).not.toBe("secret-key");
    const encrypted = stored?.streamKeyEncrypted;
    expect(encrypted).toBeTruthy();
    expect(decryptStreamKey(encrypted as string)).toBe("secret-key");
    expect(stored?.muxStreamId).toBe("mux-1");
    expect(stored?.status).toBe("idle");
  });

  it("EndStream creates a VOD row", async () => {
    const repo = new InMemoryStreamRepository();
    const stream = await repo.createStream({ channelId: "ch1", title: "Live" });
    const useCases = createStreamUseCases(repo);
    const result = await useCases.endStream({ streamId: stream.id, assetIds: ["asset-1"] });
    expect(result.stream.status).toBe("ended");
    expect(result.vod?.assetIds).toEqual(["asset-1"]);
  });

  it("webhook active updates status to live", async () => {
    const repo = new InMemoryStreamRepository();
    const stream = await repo.createStream({
      channelId: "ch1",
      title: "Live",
      muxStreamId: "mux-2",
    });
    const useCases = createStreamUseCases(repo);
    await useCases.handleWebhook({
      type: "video.live_stream.active",
      data: { id: "mux-2" },
    });
    const updated = await repo.getStreamById(stream.id);
    expect(updated?.status).toBe("live");
  });

  it("webhook idle creates vod", async () => {
    const repo = new InMemoryStreamRepository();
    await repo.createStream({
      channelId: "ch1",
      title: "Live",
      muxStreamId: "mux-3",
    });
    const useCases = createStreamUseCases(repo);
    const result = await useCases.handleWebhook({
      type: "video.live_stream.idle",
      data: { id: "mux-3", recent_asset_ids: ["a1"] },
    });
    expect(result.stream?.status).toBe("ended");
    expect(result.vod?.assetIds).toEqual(["a1"]);
  });
});
