import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { padToMinimumDuration } from "./timing";

describe("padToMinimumDuration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits out the remainder when the work finished before the floor", async () => {
    const start = Date.now();
    vi.advanceTimersByTime(50); // simulate 50ms of real work having happened

    let resolved = false;
    const pending = padToMinimumDuration(start, 400).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(349);
    expect(resolved).toBe(false); // not yet — only 399ms have passed

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(resolved).toBe(true); // now at 400ms total
  });

  it("does not wait at all when the work already met the floor", async () => {
    const start = Date.now();
    vi.advanceTimersByTime(500); // already past the 400ms floor

    let resolved = false;
    padToMinimumDuration(start, 400).then(() => {
      resolved = true;
    });

    // Flush microtasks without advancing fake time — if this resolved
    // via an actual setTimeout, it wouldn't settle here.
    await Promise.resolve();
    await Promise.resolve();
    expect(resolved).toBe(true);
  });

  it("does not wait when the work took exactly the floor", async () => {
    const start = Date.now();
    vi.advanceTimersByTime(400);

    let resolved = false;
    padToMinimumDuration(start, 400).then(() => {
      resolved = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(resolved).toBe(true);
  });
});
