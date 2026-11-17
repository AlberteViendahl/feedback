import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { at, fixtureTickets } from "@/lib/inbox/test-fixtures";
import { TicketsProvider } from "@/components/TicketsProvider/TicketsProvider";
import { InboxContainer } from "./InboxContainer";

// FR-024 / SC-008: everything is reachable with Tab and works with Enter or Space.
// Only the clock is faked (no fake timers), so userEvent keeps working.

beforeEach(() => {
  vi.setSystemTime(at("2026-11-17T11:42:00+01:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

/** Presses Tab until `target` has focus; returns every element focused on the way. */
async function tabTo(target: HTMLElement, maxSteps = 30) {
  const visited: Element[] = [];
  for (let step = 0; step < maxSteps && document.activeElement !== target; step++) {
    await userEvent.tab();
    if (document.activeElement) visited.push(document.activeElement);
  }
  expect(document.activeElement).toBe(target);
  return visited;
}

describe("Inbox – keyboard only", () => {
  it("reaches the controls in visual order and operates them", async () => {
    render(
      <TicketsProvider initialTickets={fixtureTickets}>
        <InboxContainer />
      </TicketsProvider>,
    );

    const all = screen.getByRole("button", { name: "Alle 5" });
    const done = screen.getByRole("button", { name: "Færdig 2" });
    const category = screen.getByRole("combobox", { name: /Kategori/ });
    const sort = screen.getByRole("button", { name: "Nyeste først" });

    const visited = await tabTo(sort);
    expect(visited).toEqual([all, done, category, sort]);

    // Space on the sort toggle.
    await userEvent.keyboard(" ");
    expect(sort.textContent).toBe("Ældste først");

    // Enter on the first row (oldest first: "Gammelt forslag").
    await userEvent.tab();
    expect(document.activeElement?.textContent).toContain("Gammelt forslag");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "#FB-1001" })).toBeTruthy();

    // The panel's controls come after the rows: page link, reply field, then both actions.
    const field = screen.getByRole("textbox");
    const issue = screen.getByRole("button", { name: "Opret GitHub-issue" });
    const send = screen.getByRole("button", { name: "Færdig/send" });
    const afterRows = await tabTo(field);
    expect(afterRows.at(-2)).toBe(screen.getByRole("link", { name: "/overview" }));

    await tabTo(issue);
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toBe("GitHub-issue er oprettet.");

    await tabTo(send);
    await userEvent.keyboard(" ");
    expect(screen.getByRole("status").textContent).toBe("Svaret er sendt.");
  });

  it("switches the status filter with Enter", async () => {
    render(
      <TicketsProvider initialTickets={fixtureTickets}>
        <InboxContainer />
      </TicketsProvider>,
    );
    const done = screen.getByRole("button", { name: "Færdig 2" });
    await tabTo(done);
    await userEvent.keyboard("{Enter}");
    expect(done.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
