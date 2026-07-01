import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafeRedirectPath } from "../src/lib/auth/redirects.ts";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../src/lib/validation/auth.ts";

describe("auth validation schemas", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      displayName: "Test User",
      email: "TEST@example.com",
      password: "password123",
      confirmPassword: "password123"
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "test@example.com");
    }
  });

  it("rejects mismatched registration passwords", () => {
    const result = registerSchema.safeParse({
      displayName: "Test User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different123"
    });

    assert.equal(result.success, false);
  });

  it("rejects short reset passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "short",
      confirmPassword: "short"
    });

    assert.equal(result.success, false);
  });

  it("accepts login and forgot password email formats", () => {
    assert.equal(
      loginSchema.safeParse({
        email: "student@example.com",
        password: "secret"
      }).success,
      true
    );
    assert.equal(
      forgotPasswordSchema.safeParse({ email: "student@example.com" }).success,
      true
    );
  });

  it("accepts safe profile display name changes only", () => {
    assert.equal(
      updateProfileSchema.safeParse({ displayName: "Opiskelija" }).success,
      true
    );
    assert.equal(updateProfileSchema.safeParse({ displayName: "A" }).success, false);
  });
});

describe("safe redirect paths", () => {
  it("preserves internal destination paths", () => {
    assert.equal(getSafeRedirectPath("/projects?status=active"), "/projects?status=active");
  });

  it("rejects external and auth-loop redirects", () => {
    assert.equal(getSafeRedirectPath("https://example.com"), "/dashboard");
    assert.equal(getSafeRedirectPath("//example.com"), "/dashboard");
    assert.equal(getSafeRedirectPath("/login"), "/dashboard");
    assert.equal(getSafeRedirectPath(null), "/dashboard");
  });
});
