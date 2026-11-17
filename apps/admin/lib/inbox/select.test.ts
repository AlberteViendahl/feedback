import { describe, expect, it } from "vitest";
import { getCounts, getSelectedTicket, getVisibleTickets } from "./select";
import {
  createInitialState,
  inboxReducer,
  type CategoryFilter,
  type SortOrder,
  type StatusFilter,
} from "./state";
import { fixtureTickets } from "./test-fixtures";

// fixtureTickets (newest first): t1 bug/open, t2 idea/open, t3 bug/done,
// t4 general/in_progress, t5 idea/done.
const expected: Record<StatusFilter, Record<CategoryFilter, string[]>> = {
  all: {
    all: ["t1", "t2", "t3", "t4", "t5"],
    bug: ["t1", "t3"],
    idea: ["t2", "t5"],
    general: ["t4"],
  },
  done: {
    all: ["t3", "t5"],
    bug: ["t3"],
    idea: ["t5"],
    general: [],
  },
};

const combinations = (["all", "done"] as const).flatMap((statusFilter) =>
  (["all", "bug", "idea", "general"] as const).flatMap((categoryFilter) =>
    (["newest", "oldest"] as const).map(
      (sortOrder) => [statusFilter, categoryFilter, sortOrder] as const,
    ),
  ),
);

describe("getVisibleTickets", () => {
  it.each(combinations)(
    "status %s, category %s, sorted %s",
    (statusFilter: StatusFilter, categoryFilter: CategoryFilter, sortOrder: SortOrder) => {
      const state = { ...createInitialState(fixtureTickets), statusFilter, categoryFilter, sortOrder };
      const ids = expected[statusFilter][categoryFilter];
      const ordered = sortOrder === "newest" ? ids : [...ids].reverse();
      expect(getVisibleTickets(state).map((ticket) => ticket._id)).toEqual(ordered);
    },
  );

  it("sorts by time even when the input is unordered", () => {
    const state = createInitialState([...fixtureTickets].reverse());
    expect(getVisibleTickets(state).map((ticket) => ticket._id)).toEqual(["t1", "t2", "t3", "t4", "t5"]);
  });
});

describe("getCounts", () => {
  it.each([
    ["all", { all: 5, done: 2 }],
    ["bug", { all: 2, done: 1 }],
    ["idea", { all: 2, done: 1 }],
    ["general", { all: 1, done: 0 }],
  ] as const)("counts tickets in category %s", (category, counts) => {
    expect(getCounts(fixtureTickets, category)).toEqual(counts);
  });
});

describe("getSelectedTicket", () => {
  it("returns null when nothing is selected", () => {
    expect(getSelectedTicket(createInitialState(fixtureTickets))).toBeNull();
  });

  it("returns the selected ticket while it is visible", () => {
    const state = inboxReducer(createInitialState(fixtureTickets), { type: "select", id: "t1" });
    expect(getSelectedTicket(state)?._id).toBe("t1");
  });

  it("returns null when a filter hides the selected ticket", () => {
    let state = inboxReducer(createInitialState(fixtureTickets), { type: "select", id: "t1" });
    state = inboxReducer(state, { type: "setStatusFilter", value: "done" });
    expect(getSelectedTicket(state)).toBeNull();
  });
});
