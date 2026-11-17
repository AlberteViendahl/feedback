import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureTickets } from "@/lib/inbox/test-fixtures";
import { TicketList } from "./TicketList";

describe("TicketList", () => {
  it("renders one row per ticket in the given order", () => {
    render(<TicketList tickets={fixtureTickets} selectedId={null} now={null} onSelect={() => {}} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(fixtureTickets.length);
    rows.forEach((row, index) => {
      expect(row.textContent).toContain(fixtureTickets[index].description);
    });
  });

  it("shows an empty-state message when there are no tickets", () => {
    render(<TicketList tickets={[]} selectedId={null} now={null} onSelect={() => {}} />);
    expect(screen.getByText("Ingen feedback matcher filtrene.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
