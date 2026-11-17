import { describe, expect, it } from "vitest";
import { STANDARD_REPLY, createInitialState, inboxReducer, type InboxState } from "./state";
import { at, fixtureTickets } from "./test-fixtures";

const now = at("2026-11-17T11:42:00+01:00");

function selected(state: InboxState) {
  return state.tickets.find((ticket) => ticket._id === state.selectedId);
}

function stateWithSelected(id: string) {
  return inboxReducer(createInitialState(fixtureTickets), { type: "select", id });
}

describe("createInitialState", () => {
  it("starts with all tickets, default filters and nothing selected", () => {
    expect(createInitialState(fixtureTickets)).toEqual({
      tickets: fixtureTickets,
      statusFilter: "all",
      categoryFilter: "all",
      sortOrder: "newest",
      selectedId: null,
      replyDraft: STANDARD_REPLY,
      notice: null,
    });
  });
});

describe("select", () => {
  it("opens the ticket, marks it read and resets the draft and notice", () => {
    const edited = { ...createInitialState(fixtureTickets), replyDraft: "kladde", notice: "reply-sent" as const };
    const state = inboxReducer(edited, { type: "select", id: "t1" });

    expect(state.selectedId).toBe("t1");
    expect(selected(state)?.isRead).toBe(true);
    expect(state.replyDraft).toBe(STANDARD_REPLY);
    expect(state.notice).toBeNull();
  });

  it("does not mutate the previous state", () => {
    const before = createInitialState(fixtureTickets);
    inboxReducer(before, { type: "select", id: "t1" });
    expect(before.tickets[0].isRead).toBe(false);
  });

  it("ignores unknown ids", () => {
    const before = createInitialState(fixtureTickets);
    expect(inboxReducer(before, { type: "select", id: "missing" })).toBe(before);
  });
});

describe("filters and sort", () => {
  it("stores each setting", () => {
    let state = createInitialState(fixtureTickets);
    state = inboxReducer(state, { type: "setStatusFilter", value: "done" });
    state = inboxReducer(state, { type: "setCategoryFilter", value: "idea" });
    state = inboxReducer(state, { type: "setSortOrder", value: "oldest" });
    expect(state).toMatchObject({ statusFilter: "done", categoryFilter: "idea", sortOrder: "oldest" });
  });
});

describe("sendReply", () => {
  it("saves the trimmed reply, marks the ticket done and shows a notice", () => {
    let state = stateWithSelected("t1");
    state = inboxReducer(state, { type: "editReply", text: "  Tak, vi kigger på det.  " });
    state = inboxReducer(state, { type: "sendReply", now });

    expect(selected(state)?.reply).toEqual({ text: "Tak, vi kigger på det.", sentAt: now });
    expect(selected(state)?.status).toBe("done");
    expect(state.notice).toBe("reply-sent");
  });

  it("moves an in-progress ticket to done", () => {
    const state = inboxReducer(stateWithSelected("t4"), { type: "sendReply", now });
    expect(selected(state)?.status).toBe("done");
  });

  it("does nothing when the draft is blank", () => {
    const blank = inboxReducer(stateWithSelected("t1"), { type: "editReply", text: "   " });
    expect(inboxReducer(blank, { type: "sendReply", now })).toBe(blank);
  });

  it("does nothing when a reply was already sent", () => {
    const sent = inboxReducer(stateWithSelected("t1"), { type: "sendReply", now });
    const again = inboxReducer(sent, { type: "editReply", text: "Endnu et svar" });
    expect(inboxReducer(again, { type: "sendReply", now: now + 1000 })).toBe(again);
  });

  it("does nothing when no ticket is selected", () => {
    const state = createInitialState(fixtureTickets);
    expect(inboxReducer(state, { type: "sendReply", now })).toBe(state);
  });
});

describe("createIssue", () => {
  it("marks the issue created, moves the ticket to in progress and shows a notice", () => {
    const state = inboxReducer(stateWithSelected("t1"), { type: "createIssue" });
    expect(selected(state)?.githubIssueCreated).toBe(true);
    expect(selected(state)?.status).toBe("in_progress");
    expect(state.notice).toBe("issue-created");
  });

  it("keeps a done ticket done", () => {
    const state = inboxReducer(stateWithSelected("t3"), { type: "createIssue" });
    expect(selected(state)?.status).toBe("done");
    expect(selected(state)?.githubIssueCreated).toBe(true);
  });

  it("does nothing when an issue already exists", () => {
    const state = stateWithSelected("t4");
    expect(inboxReducer(state, { type: "createIssue" })).toBe(state);
  });
});
