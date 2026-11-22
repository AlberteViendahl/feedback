import { render, screen, within } from "@testing-library/react";
import { Activity } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { at, fixtureTickets, makeTicket } from "@/lib/inbox/test-fixtures";
import { useTicketsStore } from "@/lib/tickets/store";
import { InboxContainer } from "./InboxContainer";

// Only the system clock is faked (no fake timers), so userEvent keeps working.
beforeEach(() => {
  vi.setSystemTime(at("2026-11-17T11:42:00+01:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderInbox(tickets = fixtureTickets) {
  useTicketsStore.setState({ tickets });
  render(<InboxContainer />);
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

describe("Inbox – searching (spec 003, US1)", () => {
  const searchField = () => screen.getByRole("searchbox", { name: "Søg i feedback" });

  it("puts the search bar directly before the inbox, outside it (research R6)", () => {
    renderInbox();
    const inbox = screen.getByRole("region", { name: "Feedback-indbakke" });
    expect(inbox.previousElementSibling).toBe(screen.getByRole("search"));
  });

  it("narrows the list while typing, without Enter (US1-1)", async () => {
    const { list } = renderInbox();
    await userEvent.type(searchField(), "forslag");
    expect(rowTitles(list)).toEqual(["Et forslag", "Gammelt forslag"]);
  });

  it("ignores case, including Danish letters (US1-3)", async () => {
    const { list } = renderInbox();
    await userEvent.type(searchField(), "FØRSTE");
    expect(rowTitles(list)).toEqual(["Første fejl"]);
  });

  it("needs every word to match (US1-4)", async () => {
    const { list } = renderInbox();
    await userEvent.type(searchField(), "første fejl");
    expect(rowTitles(list)).toEqual(["Første fejl"]);

    await userEvent.clear(searchField());
    await userEvent.type(searchField(), "fejl forslag");
    expect(screen.queryByRole("list", { name: "Feedback" })).toBeNull();
  });

  it("combines with the category and Færdig filters and the counts follow (US1-5)", async () => {
    renderInbox();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Kategori/ }), "Fejl");
    await userEvent.type(searchField(), "fejl");
    expect(screen.getByRole("button", { name: "Alle 2" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Færdig 1" }));

    const list = screen.getByRole("list", { name: "Feedback" });
    expect(rowTitles(list)).toEqual(["Løst fejl"]);
  });

  it("says when the search finds nothing, and treats spaces as no search (US1-6)", async () => {
    renderInbox();
    await userEvent.type(searchField(), "zzz");
    expect(screen.getByText("Ingen feedback matcher søgningen.")).toBeTruthy();

    await userEvent.clear(searchField());
    await userEvent.type(searchField(), "   ");
    expect(rowTitles(screen.getByRole("list", { name: "Feedback" }))).toHaveLength(fixtureTickets.length);
    expect(screen.queryByText(/Ingen feedback matcher/)).toBeNull();
  });

  it("restores the list on Escape and keeps the filters (US1-7)", async () => {
    const { list } = renderInbox();
    await userEvent.click(screen.getByRole("button", { name: "Færdig 2" }));
    await userEvent.type(searchField(), "løst");
    expect(rowTitles(list)).toEqual(["Løst fejl"]);

    await userEvent.keyboard("{Escape}");
    expect((searchField() as HTMLInputElement).value).toBe("");
    expect(rowTitles(list)).toEqual(["Løst fejl", "Gammelt forslag"]);
    expect(screen.getByRole("button", { name: "Færdig 2" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("hides the open ticket while the search does not match it, and shows it again after (US1-8)", async () => {
    const { list } = renderInbox();
    await userEvent.click(rowFor(list, "Første fejl"));
    await userEvent.type(searchField(), "forslag");
    expect(screen.getByText("Vælg en feedback i listen for at se detaljerne.")).toBeTruthy();

    await userEvent.clear(searchField());
    expect(screen.getByRole("heading", { name: "#FB-1005" })).toBeTruthy();
  });

  it("marks nothing as read (FR-014)", async () => {
    const { list } = renderInbox();
    await userEvent.type(searchField(), "første");
    await userEvent.clear(searchField());
    expect(within(rowFor(list, "Første fejl")).getByText("Ny")).toBeTruthy();
  });

  it("starts empty again when the inbox remounts (FR-015)", async () => {
    useTicketsStore.setState({ tickets: fixtureTickets });
    const { rerender } = render(<InboxContainer key="first" />);
    await userEvent.type(searchField(), "forslag");

    rerender(<InboxContainer key="second" />);
    expect((searchField() as HTMLInputElement).value).toBe("");
    expect(rowTitles(screen.getByRole("list", { name: "Feedback" }))).toHaveLength(fixtureTickets.length);
  });

  it("starts fresh when Next.js hides the page and shows it again (FR-015, spec 002 FR-017)", async () => {
    // With Cache Components, Next.js hides a page you navigate away from with <Activity>
    // instead of unmounting it (research R9).
    function Page({ mode }: { mode: "visible" | "hidden" }) {
      return (
        <Activity mode={mode}>
          <InboxContainer />
        </Activity>
      );
    }
    useTicketsStore.setState({ tickets: fixtureTickets });
    const { rerender } = render(<Page mode="visible" />);
    await userEvent.type(searchField(), "første");
    await userEvent.click(rowFor(screen.getByRole("list", { name: "Feedback" }), "Første fejl"));
    await userEvent.click(screen.getByRole("button", { name: "Færdig 0" }));

    rerender(<Page mode="hidden" />);
    rerender(<Page mode="visible" />);

    expect((searchField() as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("button", { name: "Alle 5" }).getAttribute("aria-pressed")).toBe("true");
    expect(rowTitles(screen.getByRole("list", { name: "Feedback" }))).toHaveLength(fixtureTickets.length);
    expect(screen.getByText("Vælg en feedback i listen for at se detaljerne.")).toBeTruthy();
    // Ticket changes live in the store and survive: the opened ticket stays read.
    expect(within(rowFor(screen.getByRole("list", { name: "Feedback" }), "Første fejl")).queryByText("Ny")).toBeNull();
  });

  it("finds and shows markup in feedback as plain text (Principle III)", async () => {
    const markup = "<img src=x onerror=alert(1)>";
    const { list } = renderInbox([...fixtureTickets, makeTicket({ _id: "x1", number: 1099, description: markup })]);
    await userEvent.type(searchField(), "<img");
    expect(rowTitles(list)).toEqual([markup]);
    expect(document.querySelector("img[src='x']")).toBeNull();
  });
});
