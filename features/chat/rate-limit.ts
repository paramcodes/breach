export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/** Per-user chat send rate limit: 20 messages per 10 seconds. */
export const CHAT_RATE_LIMIT: RateLimiterOptions = { limit: 20, windowMs: 10_000 };

/**
 * Sliding-window rate limiter. Buckets are per key (user id); timestamps
 * outside the window are dropped on every check so the window slides.
 */
export class RateLimiter {
  private readonly buckets = new Map<string, number[]>();

  constructor(private readonly options: RateLimiterOptions) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    const windowStart = now - this.options.windowMs;
    const stamps = (this.buckets.get(key) ?? []).filter((stamp) => stamp > windowStart);
    this.buckets.set(key, stamps);
    const allowed = stamps.length < this.options.limit;
    const oldest = stamps[0];
    const retryAfterMs = allowed
      ? 0
      : oldest !== undefined
        ? Math.max(0, oldest + this.options.windowMs - now)
        : this.options.windowMs;
    return {
      allowed,
      remaining: Math.max(0, this.options.limit - stamps.length - (allowed ? 1 : 0)),
      retryAfterMs,
    };
  }

  /** Consume one slot if the key is under the limit. */
  allow(key: string, now: number = Date.now()): boolean {
    const result = this.check(key, now);
    if (result.allowed) this.record(key, now);
    return result.allowed;
  }

  record(key: string, now: number = Date.now()): void {
    const stamps = this.buckets.get(key) ?? [];
    stamps.push(now);
    this.buckets.set(key, stamps);
  }

  reset(key?: string): void {
    if (key) this.buckets.delete(key);
    else this.buckets.clear();
  }
}

/** True when the key already has `limit` stamps inside the sliding window. */
export function isRateLimited(
  _key: string,
  stamps: number[],
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  const windowStart = now - windowMs;
  return stamps.filter((stamp) => stamp > windowStart).length >= limit;
}

export function createRateLimiter(options: RateLimiterOptions = CHAT_RATE_LIMIT): RateLimiter {
  return new RateLimiter(options);
}

/** Slow mode gate: true when enough time has passed since the last message. */
export function canSendInSlowMode(
  lastSentAtMs: number | null,
  slowModeSeconds: number,
  now: number = Date.now(),
): boolean {
  if (lastSentAtMs === null) return true;
  return now - lastSentAtMs >= slowModeSeconds * 1000;
}
