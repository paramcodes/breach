import { describe, expect, it } from "vitest";

import { canSendInSlowMode, createRateLimiter, isRateLimited } from "../rate-limit";

describe("rate limiting", () => {
  it("allows up to limit then blocks", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(limiter.allow("u1")).toBe(true);
    expect(limiter.allow("u1")).toBe(true);
    expect(limiter.allow("u1")).toBe(false);
  });

  it("resets after window", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 10 });
    const now = 1000;
    expect(limiter.allow("u1", now)).toBe(true);
    expect(limiter.allow("u1", now + 20)).toBe(true);
  });

  it("isRateLimited helper", () => {
    expect(isRateLimited("u1", [1000, 1001], 2, 10000, 1002)).toBe(true);
    expect(isRateLimited("u1", [1000], 2, 10000, 1002)).toBe(false);
  });

  it("slow mode", () => {
    expect(canSendInSlowMode(null, 5, 1000)).toBe(true);
    expect(canSendInSlowMode(1000, 5, 3000)).toBe(false);
    expect(canSendInSlowMode(1000, 5, 7000)).toBe(true);
  });
});
