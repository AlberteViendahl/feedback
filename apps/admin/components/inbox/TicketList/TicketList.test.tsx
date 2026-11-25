import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureTickets } from "@/lib/inbox/test-fixtures";
import { mockCategories } from "@/lib/mock-categories";
import { TicketList } from "./TicketList";

describe("TicketList", () => {
  it("renders one row per ticket in the given order", () => {
    render(<TicketList categories={mockCategories} tickets={fixtureTickets} selectedId={null} now={null} isSearching={false} onSelect={() => {}} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(fixtureTickets.length);
    rows.forEach((row, index) => {
      expect(row.textContent).toContain(fixtureTickets[index].description);
    });
  });

  it("shows an empty-state message when there are no tickets", () => {
    render(<TicketList categories={mockCategories} tickets={[]} selectedId={null} now={null} isSearching={false} onSelect={() => {}} />);
    expect(screen.getByText("Ingen feedback matcher filtrene.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("says the search found nothing while a search is active", () => {
    render(<TicketList categories={mockCategories} tickets={[]} selectedId={null} now={null} isSearching onSelect={() => {}} />);
    expect(screen.getByText("Ingen feedback matcher søgningen.")).toBeTruthy();
    expect(screen.queryByText("Ingen feedback matcher filtrene.")).toBeNull();
  });
});
