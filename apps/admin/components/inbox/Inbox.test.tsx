import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { at, fixtureTickets } from "@/lib/inbox/test-fixtures";
import { TicketsProvider } from "@/components/TicketsProvider/TicketsProvider";
import { InboxContainer } from "./InboxContainer";

// Only the system clock is faked (no fake timers), so userEvent keeps working.
beforeEach(() => {
  vi.setSystemTime(at("2026-11-17T11:42:00+01:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderInbox() {
  render(
      <TicketsProvider initialTickets={fixtureTickets}>
        <InboxContainer />
      </TicketsProvider>,
    );
  return { list: screen.getByRole("list", { name: "Feedback" }) };
}

function rowTitles(list: HTMLElement) {
  return within(list)
    .getAllByRole("button")
    .map((row) => row.querySelector(".text-title")?.textContent);
}

describe("Inbox – scanning the list (US1)", () => {
  it("lists every ticket, newest first", () => {
    const { list } = renderInbox();
    expect(rowTitles(list)).toEqual(fixtureTickets.map((ticket) => ticket.description));
  });

  it("marks unread tickets with Ny", () => {
    const { list } = renderInbox();
    const unread = fixtureTickets.filter((ticket) => !ticket.isRead).length;
    expect(within(list).getAllByText("Ny")).toHaveLength(unread);
  });

  it("shows relative times once the current time is known", () => {
    const { list } = renderInbox();
    expect(within(list).getByText("42 min siden")).toBeTruthy();
  });

  it("has no 'new feedback arrived' banner (FR-007)", () => {
    renderInbox();
    expect(screen.queryByText(/ny feedback|new feedback/i)).toBeNull();
  });

  it("starts with nothing selected", () => {
    renderInbox();
    expect(screen.getByText("Vælg en feedback i listen for at se detaljerne.")).toBeTruthy();
  });

  it("puts the list in a scroll container inside a fixed-height card (US1-5, FR-023)", () => {
    // jsdom does not lay out pages; this checks the structure. Scrolling is checked by hand
    // in quickstart.md.
    const { list } = renderInbox();
    const scroller = list.closest(".inbox__scroll");
    expect(scroller?.className).toContain("overflow-y-auto");
    expect(scroller?.parentElement?.className).toContain("inbox__panel");
  });
});

function rowFor(list: HTMLElement, description: string) {
  return within(list).getByText(description).closest("button") as HTMLButtonElement;
}

describe("Inbox – reading a ticket (US2)", () => {
  it("opens a clicked ticket in the panel and highlights its row", async () => {
    const { list } = renderInbox();
    await userEvent.click(rowFor(list, "Første fejl"));

    expect(screen.getByRole("heading", { name: "#FB-1005" })).toBeTruthy();
    expect(rowFor(list, "Første fejl").getAttribute("aria-current")).toBe("true");
  });

  it("removes Ny for good once a ticket has been opened", async () => {
    const { list } = renderInbox();
    expect(within(rowFor(list, "Første fejl")).getByText("Ny")).toBeTruthy();

    await userEvent.click(rowFor(list, "Første fejl"));
    await userEvent.click(rowFor(list, "Et forslag"));

    expect(within(rowFor(list, "Første fejl")).queryByText("Ny")).toBeNull();
  });

  it.each(["{Enter}", " "])("opens a focused row with %s", async (key) => {
    const { list } = renderInbox();
    rowFor(list, "Et forslag").focus();
    await userEvent.keyboard(key);
    expect(screen.getByRole("heading", { name: "#FB-1004" })).toBeTruthy();
  });
});

describe("Inbox – filtering and sorting (US3)", () => {
  it("lists only done tickets under Færdig", async () => {
    const { list } = renderInbox();
    await userEvent.click(screen.getByRole("button", { name: "Færdig 2" }));
    expect(rowTitles(list)).toEqual(["Løst fejl", "Gammelt forslag"]);
  });

  it("filters by category and updates both counts", async () => {
    const { list } = renderInbox();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Kategori/ }), "Fejl");

    expect(rowTitles(list)).toEqual(["Første fejl", "Løst fejl"]);
    expect(screen.getByRole("button", { name: "Alle 2" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Færdig 1" })).toBeTruthy();
  });

  it("reverses the order with the sort toggle", async () => {
    const { list } = renderInbox();
    await userEvent.click(screen.getByRole("button", { name: "Nyeste først" }));
    expect(rowTitles(list)).toEqual(fixtureTickets.map((ticket) => ticket.description).reverse());
  });

  it("empties the panel when a filter hides the open ticket", async () => {
    const { list } = renderInbox();
    await userEvent.click(rowFor(list, "Første fejl"));
    await userEvent.click(screen.getByRole("button", { name: "Færdig 2" }));
    expect(screen.getByText("Vælg en feedback i listen for at se detaljerne.")).toBeTruthy();
  });

  it("shows the empty message when nothing matches", async () => {
    renderInbox();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Kategori/ }), "Generel feedback");
    await userEvent.click(screen.getByRole("button", { name: "Færdig 0" }));
    expect(screen.getByText("Ingen feedback matcher filtrene.")).toBeTruthy();
  });
});

describe("Inbox – replying and escalating (US4)", () => {
  async function openTicket(description: string) {
    const { list } = renderInbox();
    await userEvent.click(rowFor(list, description));
    return list;
  }

  it("sends an edited reply once and marks the ticket done", async () => {
    const list = await openTicket("Første fejl");
    const field = screen.getByRole("textbox");
    await userEvent.clear(field);
    await userEvent.type(field, "Tak, vi kigger på det.");
    await userEvent.click(screen.getByRole("button", { name: "Færdig/send" }));

    expect(screen.getByRole("status").textContent).toBe("Svaret er sendt.");
    expect(screen.getByRole("heading", { name: "Sendt svar · 17. nov. 2026, 11.42" })).toBeTruthy();
    expect(screen.getByText("Tak, vi kigger på det.")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Færdig/send" })).toBeNull();
    expect(within(rowFor(list, "Første fejl")).getByText("Færdig")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Færdig 3" })).toBeTruthy();
  });

  it("still shows the sent reply after reopening the ticket (US4-3)", async () => {
    const list = await openTicket("Første fejl");
    await userEvent.click(screen.getByRole("button", { name: "Færdig/send" }));
    await userEvent.click(rowFor(list, "Et forslag"));
    await userEvent.click(rowFor(list, "Første fejl"));

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("heading", { name: /^Sendt svar · / })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Færdig/send" })).toBeNull();
  });

  it("cannot send a blank reply", async () => {
    await openTicket("Første fejl");
    await userEvent.clear(screen.getByRole("textbox"));
    expect((screen.getByRole("button", { name: "Færdig/send" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("raises the Færdig count within the selected category", async () => {
    const { list } = renderInbox();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Kategori/ }), "Fejl");
    expect(screen.getByRole("button", { name: "Færdig 1" })).toBeTruthy();

    await userEvent.click(rowFor(list, "Første fejl"));
    await userEvent.click(screen.getByRole("button", { name: "Færdig/send" }));
    expect(screen.getByRole("button", { name: "Færdig 2" })).toBeTruthy();
  });

  it("creates one GitHub issue and moves the ticket to I gang", async () => {
    const list = await openTicket("Et forslag");
    await userEvent.click(screen.getByRole("button", { name: "Opret GitHub-issue" }));

    expect(screen.getByRole("status").textContent).toBe("GitHub-issue er oprettet.");
    expect(within(rowFor(list, "Et forslag")).getByText("I gang")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Opret GitHub-issue" })).toBeNull();
  });

  it("keeps a done ticket done when an issue is created", async () => {
    const list = await openTicket("Løst fejl");
    await userEvent.click(screen.getByRole("button", { name: "Opret GitHub-issue" }));
    expect(within(rowFor(list, "Løst fejl")).getByText("Færdig")).toBeTruthy();
  });
});
