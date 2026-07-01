import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatEcts,
  formatMinutesAsHours,
  minutesToEcts,
  minutesToHours
} from "../src/lib/calculations/ects.ts";
import {
  canManageProject,
  canRemoveProjectMember,
  canViewProjectTotal
} from "../src/lib/projects/authz.ts";
import {
  addProjectMemberSchema,
  projectFormSchema
} from "../src/lib/validation/projects.ts";

describe("project validation", () => {
  it("accepts valid project input", () => {
    const result = projectFormSchema.safeParse({
      name: "Testi",
      description: "Opiskeluprojekti"
    });

    assert.equal(result.success, true);
  });

  it("rejects too short project names", () => {
    const result = projectFormSchema.safeParse({
      name: "T",
      description: ""
    });

    assert.equal(result.success, false);
  });

  it("normalizes empty descriptions to null", () => {
    const result = projectFormSchema.safeParse({
      name: "Testi",
      description: "   "
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.description, null);
    }
  });

  it("validates member additions by project id and email", () => {
    const result = addProjectMemberSchema.safeParse({
      projectId: "00000000-0000-4000-8000-000000000000",
      email: "USER@example.com"
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "user@example.com");
    }
  });
});

describe("duration and ECTS utilities", () => {
  it("converts minutes to hours and ECTS", () => {
    assert.equal(minutesToHours(90), 1.5);
    assert.equal(minutesToEcts(1620), 1);
    assert.equal(formatEcts(810), "0.50");
    assert.equal(formatMinutesAsHours(90), "1.5 h");
  });
});

describe("project authorization helpers", () => {
  it("allows only owners to manage projects", () => {
    assert.equal(canManageProject("owner"), true);
    assert.equal(canManageProject("member"), false);
    assert.equal(canViewProjectTotal("owner"), true);
    assert.equal(canViewProjectTotal("member"), false);
  });

  it("allows removing normal members but not owners", () => {
    assert.equal(canRemoveProjectMember("owner", "member"), true);
    assert.equal(canRemoveProjectMember("owner", "owner"), false);
    assert.equal(canRemoveProjectMember("member", "member"), false);
  });
});
