import { describe, expect, it } from "vitest";
import { getCounts, getSelectedTicket, getVisibleTickets } from "./select";
import {
  createInitialView,
  inboxViewReducer,
  type CategoryFilter,
  type SortOrder,
  type StatusFilter,
} from "./state";
import { fixtureTickets } from "./test-fixtures";

// fixtureTickets (newest first): t1 bug/open "Første fejl", t2 idea/open "Et forslag",
// t3 bug/done "Løst fejl", t4 general/in_progress "Generel ros", t5 idea/done "Gammelt forslag".
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
      const view = { ...createInitialView(), statusFilter, categoryFilter, sortOrder };
      const ids = expected[statusFilter][categoryFilter];
      const ordered = sortOrder === "newest" ? ids : [...ids].reverse();
      expect(getVisibleTickets(fixtureTickets, view).map((ticket) => ticket._id)).toEqual(ordered);
    },
  );

  it("sorts by time even when the input is unordered", () => {
    const unordered = [...fixtureTickets].reverse();
    expect(getVisibleTickets(unordered, createInitialView()).map((ticket) => ticket._id)).toEqual([
      "t1",
      "t2",
      "t3",
      "t4",
      "t5",
    ]);
  });

  it.each([
    ["fejl", {}, ["t1", "t3"]],
    ["fejl", { statusFilter: "done" }, ["t3"]],
    ["fejl", { categoryFilter: "idea" }, []],
    ["FØRSTE", {}, ["t1"]],
    ["forslag", { sortOrder: "oldest" }, ["t5", "t2"]],
    ["   ", {}, ["t1", "t2", "t3", "t4", "t5"]],
  ] as const)("searches %j together with the filters %j", (search, filters, ids) => {
    const view = { ...createInitialView(), ...filters, search };
    expect(getVisibleTickets(fixtureTickets, view).map((ticket) => ticket._id)).toEqual(ids);
  });
});

describe("getCounts", () => {
  it.each([
    ["all", { all: 5, done: 2 }],
    ["bug", { all: 2, done: 1 }],
    ["idea", { all: 2, done: 1 }],
    ["general", { all: 1, done: 0 }],
  ] as const)("counts tickets in category %s", (category, counts) => {
    expect(getCounts(fixtureTickets, { categoryFilter: category, search: "" })).toEqual(counts);
  });

  it("counts only the tickets that match the search", () => {
    expect(getCounts(fixtureTickets, { categoryFilter: "all", search: "forslag" })).toEqual({ all: 2, done: 1 });
    expect(getCounts(fixtureTickets, { categoryFilter: "bug", search: "forslag" })).toEqual({ all: 0, done: 0 });
  });
});

describe("getSelectedTicket", () => {
  it("returns null when nothing is selected", () => {
    expect(getSelectedTicket(fixtureTickets, createInitialView())).toBeNull();
  });

  it("returns the selected ticket while it is visible", () => {
    const view = inboxViewReducer(createInitialView(), { type: "select", id: "t1" });
    expect(getSelectedTicket(fixtureTickets, view)?._id).toBe("t1");
  });

  it("returns null when a filter hides the selected ticket", () => {
    let view = inboxViewReducer(createInitialView(), { type: "select", id: "t1" });
    view = inboxViewReducer(view, { type: "setStatusFilter", value: "done" });
    expect(getSelectedTicket(fixtureTickets, view)).toBeNull();
  });

  it("hides the selected ticket while the search does not match it, and shows it again after", () => {
    let view = inboxViewReducer(createInitialView(), { type: "select", id: "t1" });
    view = inboxViewReducer(view, { type: "setSearch", value: "forslag" });
    expect(getSelectedTicket(fixtureTickets, view)).toBeNull();
    view = inboxViewReducer(view, { type: "setSearch", value: "" });
    expect(getSelectedTicket(fixtureTickets, view)?._id).toBe("t1");
  });
});
