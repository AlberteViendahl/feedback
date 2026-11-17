import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { fixtureTickets } from "@/lib/inbox/test-fixtures";
import { TicketsProvider, useTickets } from "./TicketsProvider";

function UnreadCount() {
  const { tickets } = useTickets();
  return <p>Ulæste: {tickets.filter((ticket) => !ticket.isRead).length}</p>;
}

function MarkFirstRead() {
  const { dispatch } = useTickets();
  return (
    <button type="button" onClick={() => dispatch({ type: "markRead", id: "t1" })}>
      Læs t1
    </button>
  );
}

describe("TicketsProvider", () => {
  it("gives children the initial tickets", () => {
    render(
      <TicketsProvider initialTickets={fixtureTickets}>
        <UnreadCount />
      </TicketsProvider>,
    );
    expect(screen.getByText("Ulæste: 1")).toBeTruthy();
  });

  it("shares dispatched changes with every consumer", async () => {
    render(
      <TicketsProvider initialTickets={fixtureTickets}>
        <MarkFirstRead />
        <UnreadCount />
      </TicketsProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Læs t1" }));
    expect(screen.getByText("Ulæste: 0")).toBeTruthy();
  });

  it("throws a clear error outside the provider", () => {
    // React logs the thrown error; keep the test output clean.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<UnreadCount />)).toThrow("useTickets must be used inside TicketsProvider");
    spy.mockRestore();
  });
});
