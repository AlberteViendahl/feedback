import { render } from "@testing-library/react";
import { Activity } from "react";
import { describe, expect, it } from "vitest";
import { addCategory, useCategoriesStore } from "@/lib/categories/store";
import { mockCategories } from "@/lib/mock-categories";
import { mockFeedback } from "@/lib/mock-feedback";
import { markRead, useTicketsStore } from "@/lib/tickets/store";
import { ResetTickets } from "./ResetTickets";

const unread = mockFeedback.find((ticket) => !ticket.isRead)!;

function tickets() {
  return useTicketsStore.getState().tickets;
}

describe("ResetTickets", () => {
  it("renders nothing", () => {
    const { container } = render(<ResetTickets />);
    expect(container.innerHTML).toBe("");
  });

  it("clears the session's ticket changes when shown (spec 004, FR-008)", () => {
    markRead(unread._id);
    expect(tickets()).not.toBe(mockFeedback);

    render(<ResetTickets />);
    expect(tickets()).toBe(mockFeedback);
  });

  it("clears the session's category changes too (spec 006, FR-014)", () => {
    addCategory({ name: "Forbedring", icon: "inbox", color: "blue" });
    render(<ResetTickets />);
    expect(useCategoriesStore.getState().categories).toBe(mockCategories);
  });

  it("clears them again each time Next.js shows the page after hiding it", () => {
    function Page({ mode }: { mode: "visible" | "hidden" }) {
      return (
        <Activity mode={mode}>
          <ResetTickets />
        </Activity>
      );
    }
    const { rerender } = render(<Page mode="visible" />);
    markRead(unread._id);

    rerender(<Page mode="hidden" />);
    expect(tickets()).not.toBe(mockFeedback);

    rerender(<Page mode="visible" />);
    expect(tickets()).toBe(mockFeedback);
  });
});
