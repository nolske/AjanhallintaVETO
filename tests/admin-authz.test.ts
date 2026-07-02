import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAccessAdminArea } from "../src/lib/admin/authz.ts";

describe("admin authorization helpers", () => {
  it("allows only trusted admin profile roles", () => {
    assert.equal(canAccessAdminArea("admin"), true);
    assert.equal(canAccessAdminArea("user"), false);
    assert.equal(canAccessAdminArea(null), false);
    assert.equal(canAccessAdminArea(undefined), false);
  });
});
