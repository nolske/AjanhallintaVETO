import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkRateLimit,
  createRateLimitKey,
  resetRateLimitsForTests
} from "../src/lib/security/rate-limit.ts";

describe("rate limiting helpers", () => {
  it("allows requests up to the configured limit", () => {
    resetRateLimitsForTests();
    const key = createRateLimitKey("login", ["USER@example.com", "127.0.0.1"]);
    const config = { limit: 2, windowMs: 60_000 };

    assert.equal(checkRateLimit(key, config, 1_000).allowed, true);
    assert.equal(checkRateLimit(key, config, 2_000).allowed, true);
    assert.equal(checkRateLimit(key, config, 3_000).allowed, false);
  });

  it("resets after the configured window", () => {
    resetRateLimitsForTests();
    const key = createRateLimitKey("forgotPassword", ["user@example.com"]);
    const config = { limit: 1, windowMs: 10_000 };

    assert.equal(checkRateLimit(key, config, 1_000).allowed, true);
    assert.equal(checkRateLimit(key, config, 2_000).allowed, false);
    assert.equal(checkRateLimit(key, config, 11_001).allowed, true);
  });

  it("normalizes rate limit key parts", () => {
    assert.equal(
      createRateLimitKey("register", [" USER@example.com ", " 127.0.0.1 "]),
      "register:user@example.com:127.0.0.1"
    );
  });
});
