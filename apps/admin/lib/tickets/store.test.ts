import { beforeEach, describe, expect, it } from "vitest";
import { at, fixtureTickets } from "@/lib/inbox/test-fixtures";
import { mockFeedback } from "@/lib/mock-feedback";
import { createIssue, markRead, resetTickets, sendReply, useTicketsStore } from "./store";

const now = at("2026-11-17T11:42:00+01:00");

function tickets() {
  return useTicketsStore.getState().tickets;
}

function find(id: string) {
  return tickets().find((ticket) => ticket._id === id);
}

describe("ticket store", () => {
  it("starts with the mock data", () => {
    expect(tickets()).toBe(mockFeedback);
  });

  describe("actions", () => {
    beforeEach(() => {
      useTicketsStore.setState({ tickets: fixtureTickets });
    });

    it("markRead marks the ticket as opened", () => {
      markRead("t1");
      expect(find("t1")?.isRead).toBe(true);
    });

    it("sendReply stores the trimmed reply and marks the ticket done", () => {
      sendReply("t1", "  Tak, vi kigger på det.  ", now);
      expect(find("t1")?.reply).toEqual({ text: "Tak, vi kigger på det.", sentAt: now });
      expect(find("t1")?.status).toBe("done");
    });

    it("createIssue marks the issue created and sets the status to in progress unless done", () => {
      createIssue("t1");
      createIssue("t3");
      expect(find("t1")).toMatchObject({ githubIssueCreated: true, status: "in_progress" });
      expect(find("t3")).toMatchObject({ githubIssueCreated: true, status: "done" });
    });

    it("keeps the same array for actions the rules do not allow", () => {
      markRead("missing");
      sendReply("t1", "   ", now);
      createIssue("t4"); // already has an issue
      expect(tickets()).toBe(fixtureTickets);

      sendReply("t1", "Første", now);
      const afterReply = tickets();
      sendReply("t1", "Anden", now + 1);
      expect(tickets()).toBe(afterReply);
    });
  });

  it("resetTickets brings back the mock data", () => {
    useTicketsStore.setState({ tickets: fixtureTickets });
    markRead("t1");
    resetTickets();
    expect(tickets()).toBe(mockFeedback);
  });
});

// This pair relies on Vitest running a file's tests in order, and on the reset after every test
// in vitest.setup.ts: the second test must not see the first test's change.
describe("between tests (spec 004 US2-3)", () => {
  const unread = mockFeedback.find((ticket) => !ticket.isRead)!;

  it("lets one test change a ticket", () => {
    markRead(unread._id);
    expect(find(unread._id)?.isRead).toBe(true);
  });

  it("starts the next test from the mock data", () => {
    expect(tickets()).toBe(mockFeedback);
    expect(find(unread._id)?.isRead).toBe(false);
  });
});
