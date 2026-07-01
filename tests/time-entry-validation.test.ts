import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDuration,
  getTodayDateString,
  hoursAndMinutesToTotalMinutes,
  isFutureDate,
  isValidDuration,
  splitMinutes
} from "../src/lib/time-entries/duration.ts";
import {
  formatEcts,
  roundEcts
} from "../src/lib/calculations/ects.ts";
import { timeEntryFormSchema } from "../src/lib/validation/time-entries.ts";

describe("time entry duration utilities", () => {
  it("converts hours and minutes to total minutes", () => {
    assert.equal(hoursAndMinutesToTotalMinutes(1, 30), 90);
    assert.deepEqual(splitMinutes(90), { hours: 1, minutes: 30 });
  });

  it("formats durations consistently", () => {
    assert.equal(formatDuration(30), "30 min");
    assert.equal(formatDuration(60), "1 h");
    assert.equal(formatDuration(90), "1 h 30 min");
  });

  it("validates duration limits", () => {
    assert.equal(isValidDuration(0), false);
    assert.equal(isValidDuration(1), true);
    assert.equal(isValidDuration(1440), true);
    assert.equal(isValidDuration(1441), false);
  });

  it("calculates and rounds ECTS consistently", () => {
    assert.equal(formatEcts(1620), "1.00");
    assert.equal(roundEcts(810), 0.5);
  });
});

describe("time entry date and form validation", () => {
  it("detects future dates", () => {
    assert.equal(isFutureDate("2026-07-02", "2026-07-01"), true);
    assert.equal(isFutureDate("2026-07-01", "2026-07-01"), false);
  });

  it("builds today's date string", () => {
    assert.equal(getTodayDateString(new Date("2026-07-01T12:00:00.000Z")), "2026-07-01");
  });

  it("accepts valid time entry form input", () => {
    const result = timeEntryFormSchema.safeParse({
      projectId: "00000000-0000-4000-8000-000000000000",
      entryDate: "2026-07-01",
      hours: "1",
      minutes: "30",
      description: "Tyoskentely"
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.durationMinutes, 90);
    }
  });

  it("rejects zero duration and future dates", () => {
    assert.equal(
      timeEntryFormSchema.safeParse({
        projectId: "00000000-0000-4000-8000-000000000000",
        entryDate: "2026-07-01",
        hours: "0",
        minutes: "0",
        description: ""
      }).success,
      false
    );

    assert.equal(
      timeEntryFormSchema.safeParse({
        projectId: "00000000-0000-4000-8000-000000000000",
        entryDate: "2999-01-01",
        hours: "1",
        minutes: "0",
        description: ""
      }).success,
      false
    );
  });
});
