import { describe, expect, it } from "vitest";
import { fixtureTickets, makeTicket } from "@/lib/inbox/test-fixtures";
import { getNewCounts } from "./counts";
import { getKeyNumbers } from "./key-numbers";

const now = new Date(2026, 10, 18, 12, 0).getTime(); // Wednesday 18 Nov 2026, 12:00 local

describe("getKeyNumbers – new and in progress (US1)", () => {
  it("counts unopened tickets as new, with the same rule as the side menu", () => {
    expect(getKeyNumbers(fixtureTickets, now).newCount).toBe(getNewCounts(fixtureTickets).total);
  });

  it("counts opened tickets that are not done as in progress", () => {
    const tickets = [
      makeTicket({ _id: "unopened", isRead: false }),
      makeTicket({ _id: "opened", isRead: true, status: "open" }),
      makeTicket({ _id: "working", isRead: true, status: "in_progress" }),
      makeTicket({ _id: "done", isRead: true, status: "done" }),
    ];
    expect(getKeyNumbers(tickets, now)).toMatchObject({ newCount: 1, inProgressCount: 2 });
  });

  it("counts both without knowing the time", () => {
    const tickets = [makeTicket({ _id: "a", isRead: false }), makeTicket({ _id: "b", isRead: true })];
    expect(getKeyNumbers(tickets, null)).toMatchObject({ newCount: 1, inProgressCount: 1 });
  });

  it("gives zeros for no tickets", () => {
    expect(getKeyNumbers([], now)).toMatchObject({ newCount: 0, inProgressCount: 0 });
  });
});

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

describe("getKeyNumbers – done in the last 30 days (US2)", () => {
  function done(id: string, completedAt?: number) {
    return makeTicket({ _id: id, isRead: true, status: "done", completedAt });
  }

  it("counts tickets completed up to exactly 30 days ago", () => {
    const tickets = [
      done("a", now - DAY),
      done("b", now - 29 * DAY),
      done("c", now - 30 * DAY),
      done("d", now - 30 * DAY - MINUTE),
    ];
    expect(getKeyNumbers(tickets, now).doneLast30Days).toBe(3);
  });

  it("skips done tickets without a completion time, and tickets that are not done", () => {
    const tickets = [
      done("a"),
      makeTicket({ _id: "b", isRead: true, status: "in_progress", completedAt: now - DAY }),
    ];
    expect(getKeyNumbers(tickets, now).doneLast30Days).toBe(0);
  });

  it("is unknown until the current time is known", () => {
    expect(getKeyNumbers([done("a", now - DAY)], null).doneLast30Days).toBeNull();
  });
});

describe("getKeyNumbers – bugs this week (US3)", () => {
  // Local times, so the week starts on Monday 00:00 wherever the tests run.
  const local = (month: number, day: number, hour = 12, minute = 0) =>
    new Date(2026, month - 1, day, hour, minute).getTime();

  function sent(id: string, time: number, category: "bug" | "idea" | "general" = "bug") {
    return makeTicket({ _id: id, category, _creationTime: time });
  }

  /** `count` bugs sent at `time`. */
  function bugs(prefix: string, count: number, time: number) {
    return Array.from({ length: count }, (_, index) => sent(`${prefix}${index}`, time));
  }

  it("counts bugs from Monday 00:00, not the Sunday before", () => {
    const tickets = [sent("monday", local(11, 16, 0, 0)), sent("sunday", local(11, 15, 23, 30))];
    expect(getKeyNumbers(tickets, now).bugsThisWeek).toBe(1);
  });

  it("ignores ideas and general feedback", () => {
    const tickets = [sent("bug", local(11, 17)), sent("idea", local(11, 17), "idea"), sent("ros", local(11, 17), "general")];
    expect(getKeyNumbers(tickets, now).bugsThisWeek).toBe(1);
  });

  it("compares with the whole of last week", () => {
    const tickets = [...bugs("now", 7, local(11, 17)), ...bugs("before", 4, local(11, 10))];
    expect(getKeyNumbers(tickets, now)).toMatchObject({ bugsThisWeek: 7, bugsChange: 3 });
  });

  it("shows fewer bugs as a negative change", () => {
    const tickets = [...bugs("now", 2, local(11, 17)), ...bugs("before", 5, local(11, 15, 23, 30))];
    expect(getKeyNumbers(tickets, now)).toMatchObject({ bugsThisWeek: 2, bugsChange: -3 });
  });

  it("gives no change for equal weeks, and ignores bugs from before last week", () => {
    const tickets = [sent("now", local(11, 16)), sent("before", local(11, 9, 0, 0)), sent("old", local(11, 8, 23, 59))];
    expect(getKeyNumbers(tickets, now)).toMatchObject({ bugsThisWeek: 1, bugsChange: 0 });
  });

  it("starts the week at Monday 00:00 across a daylight-saving change", () => {
    // Danish summer time ended on Sunday 25 October 2026.
    const wednesday = local(10, 28);
    const tickets = [sent("monday", local(10, 26, 0, 0)), sent("sunday", local(10, 25, 23, 59)), sent("last", local(10, 19, 0, 0))];
    expect(getKeyNumbers(tickets, wednesday)).toMatchObject({ bugsThisWeek: 1, bugsChange: -1 });
  });

  it("is unknown until the current time is known", () => {
    expect(getKeyNumbers([sent("a", local(11, 17))], null)).toMatchObject({
      bugsThisWeek: null,
      bugsChange: null,
    });
  });
});
