import { describe, expect, it } from "vitest";

import { InMemoryPresenceChannel, InMemoryPresenceStore } from "../presence";

describe("presence", () => {
  it("tracks distinct viewers and count on join/leave", () => {
    const store = new InMemoryPresenceStore();
    expect(store.join("ch1", "u1")).toBe(1);
    expect(store.join("ch1", "u2")).toBe(2);
    // rejoining the same viewer does not increase the distinct count
    expect(store.join("ch1", "u1")).toBe(2);
    expect(store.count("ch1")).toBe(2);
    // a leave only drops one reference; distinct count drops at zero refs
    expect(store.leave("ch1", "u1")).toBe(2);
    expect(store.count("ch1")).toBe(2);
    expect(store.leave("ch1", "u1")).toBe(1);
    expect(store.count("ch1")).toBe(1);
    expect(store.leave("ch1", "u2")).toBe(0);
    expect(store.count("ch1")).toBe(0);
  });

  it("channel notifies subscribers with the current count", () => {
    const store = new InMemoryPresenceStore();
    const channel = new InMemoryPresenceChannel(store, "ch1", "u1");
    const counts: number[] = [];
    const unsub = channel.subscribeCount((count) => counts.push(count));
    // subscribeCount emits the current count immediately
    expect(counts).toEqual([0]);
    channel.join();
    expect(counts).toEqual([0, 1]);
    channel.leave();
    expect(counts).toEqual([0, 1, 0]);
    unsub();
    channel.join();
    expect(counts).toEqual([0, 1, 0]);
  });
});
