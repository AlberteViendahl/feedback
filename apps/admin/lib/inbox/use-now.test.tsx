import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./use-now";

const start = new Date("2026-11-17T10:42:31Z");
const startMinute = Date.parse("2026-11-17T10:42:00Z");

function PrintNow() {
  return <span>{String(useNow())}</span>;
}

describe("useNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the current time rounded down to the minute", () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toBe(startMinute);
  });

  it("moves on every minute", () => {
    const { result } = renderHook(() => useNow());
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current).toBe(startMinute + 60_000);
  });

  it("stops its timer when unmounted", () => {
    const { unmount } = renderHook(() => useNow());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("is null when rendered on the server", () => {
    expect(renderToString(<PrintNow />)).toBe("<span>null</span>");
  });
});
