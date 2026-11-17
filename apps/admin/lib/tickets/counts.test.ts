import { describe, expect, it } from "vitest";
import { makeTicket } from "@/lib/inbox/test-fixtures";
import type { Feedback, Platform } from "@/lib/types";
import { formatNewCount, getNewCounts } from "./counts";

function ticket(id: string, platform: Platform, isRead: boolean): Feedback {
  const base = makeTicket({ _id: id, isRead });
  return { ...base, context: { ...base.context, platform } };
}

describe("getNewCounts", () => {
  it("counts unread tickets per platform and in total", () => {
    const tickets = [
      ticket("a", "geotracking", false),
      ticket("b", "geotracking", false),
      ticket("c", "geotracking", true),
      ticket("d", "simpleserp", false),
    ];
    expect(getNewCounts(tickets)).toEqual({
      total: 3,
      byPlatform: { geotracking: 2, simpleserp: 1 },
    });
  });

  it("includes every platform, with 0 when it has no new tickets", () => {
    expect(getNewCounts([ticket("a", "simpleserp", false)]).byPlatform).toEqual({
      geotracking: 0,
      simpleserp: 1,
    });
  });

  it("is all zero when everything has been opened", () => {
    expect(getNewCounts([ticket("a", "geotracking", true)])).toEqual({
      total: 0,
      byPlatform: { geotracking: 0, simpleserp: 0 },
    });
  });
});

describe("formatNewCount", () => {
  it.each([
    [0, null],
    [1, "1 ny"],
    [4, "4 nye"],
  ] as const)("formats %d as %j", (count, expected) => {
    expect(formatNewCount(count)).toBe(expected);
  });
});
