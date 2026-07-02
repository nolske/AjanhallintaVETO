export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function createRateLimitKey(scope: string, parts: Array<string | null | undefined>) {
  const normalizedParts = parts.map((part) =>
    String(part ?? "unknown")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
  );

  return [scope, ...normalizedParts].join(":");
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  now = Date.now()
) {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    });

    return {
      allowed: true,
      remaining: config.limit - 1,
      retryAfterSeconds: 0
    };
  }

  if (existing.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000)
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: config.limit - existing.count,
    retryAfterSeconds: 0
  };
}

export function resetRateLimitsForTests() {
  buckets.clear();
}
