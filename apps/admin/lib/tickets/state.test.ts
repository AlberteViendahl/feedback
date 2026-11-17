import { describe, expect, it } from "vitest";
import { at, fixtureTickets } from "@/lib/inbox/test-fixtures";
import { ticketsReducer } from "./state";

const now = at("2026-11-17T11:42:00+01:00");

function find(tickets: typeof fixtureTickets, id: string) {
  return tickets.find((ticket) => ticket._id === id);
}

describe("markRead", () => {
  it("marks the ticket as opened", () => {
    const tickets = ticketsReducer(fixtureTickets, { type: "markRead", id: "t1" });
    expect(find(tickets, "t1")?.isRead).toBe(true);
  });

  it("does not mutate the input", () => {
    ticketsReducer(fixtureTickets, { type: "markRead", id: "t1" });
    expect(find(fixtureTickets, "t1")?.isRead).toBe(false);
  });

  it("returns the same array for unknown ids", () => {
    expect(ticketsReducer(fixtureTickets, { type: "markRead", id: "missing" })).toBe(fixtureTickets);
  });
});

describe("sendReply", () => {
  it("stores the trimmed reply and marks an open ticket done", () => {
    const tickets = ticketsReducer(fixtureTickets, {
      type: "sendReply",
      id: "t1",
      text: "  Tak, vi kigger på det.  ",
      now,
    });
    expect(find(tickets, "t1")?.reply).toEqual({ text: "Tak, vi kigger på det.", sentAt: now });
    expect(find(tickets, "t1")?.status).toBe("done");
  });

  it("marks an in-progress ticket done", () => {
    const tickets = ticketsReducer(fixtureTickets, { type: "sendReply", id: "t4", text: "Tak", now });
    expect(find(tickets, "t4")?.status).toBe("done");
  });

  it("is a no-op for blank text", () => {
    expect(ticketsReducer(fixtureTickets, { type: "sendReply", id: "t1", text: "   ", now })).toBe(
      fixtureTickets,
    );
  });

  it("is a no-op when a reply already exists", () => {
    const once = ticketsReducer(fixtureTickets, { type: "sendReply", id: "t1", text: "Første", now });
    expect(ticketsReducer(once, { type: "sendReply", id: "t1", text: "Anden", now: now + 1 })).toBe(once);
  });

  it("is a no-op for unknown ids", () => {
    expect(ticketsReducer(fixtureTickets, { type: "sendReply", id: "missing", text: "Hej", now })).toBe(
      fixtureTickets,
    );
  });
});

describe("createIssue", () => {
  it("records the issue and moves an open ticket to in progress", () => {
    const tickets = ticketsReducer(fixtureTickets, { type: "createIssue", id: "t1" });
    expect(find(tickets, "t1")?.githubIssueCreated).toBe(true);
    expect(find(tickets, "t1")?.status).toBe("in_progress");
  });

  it("keeps a done ticket done", () => {
    const tickets = ticketsReducer(fixtureTickets, { type: "createIssue", id: "t3" });
    expect(find(tickets, "t3")?.status).toBe("done");
    expect(find(tickets, "t3")?.githubIssueCreated).toBe(true);
  });

  it("is a no-op when an issue already exists", () => {
    expect(ticketsReducer(fixtureTickets, { type: "createIssue", id: "t4" })).toBe(fixtureTickets);
  });
});
