import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InboxContainer } from "@/components/inbox/InboxContainer";
import { TicketsProvider } from "@/components/TicketsProvider/TicketsProvider";
import { at, makeTicket } from "@/lib/inbox/test-fixtures";
import type { AdminUser, Feedback, Platform, Workspace } from "@/lib/types";
import { SideMenuContainer } from "./SideMenuContainer";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const workspace: Workspace = {
  _id: "ws",
  name: "Organic Growth",
  platforms: ["geotracking", "simpleserp"],
};
const user: AdminUser = { _id: "u", name: "Hussein", role: "Admin", workspaceId: "ws" };

function ticket(id: string, description: string, platform: Platform, hour: number): Feedback {
  const base = makeTicket({
    _id: id,
    description,
    _creationTime: at(`2026-11-17T${String(hour).padStart(2, "0")}:00:00+01:00`),
  });
  return { ...base, context: { ...base.context, platform } };
}

// Three unread tickets: two from GEOtracking, one from SimpleSERP.
const tickets = [
  ticket("a", "Kortet vises ikke", "geotracking", 11),
  ticket("b", "Eksport fejler", "geotracking", 10),
  ticket("c", "Søgning er langsom", "simpleserp", 9),
];

function app(inboxKey = "first") {
  return (
    <TicketsProvider initialTickets={tickets}>
      <SideMenuContainer workspace={workspace} user={user} />
      <InboxContainer key={inboxKey} />
    </TicketsProvider>
  );
}

function menuItem(name: RegExp) {
  return within(screen.getByRole("navigation", { name: "Hovedmenu" })).getByRole("link", { name });
}

function row(description: string) {
  return screen.getByText(description).closest("button") as HTMLButtonElement;
}

describe("side menu and inbox together", () => {
  it("starts with counts from the unread tickets", () => {
    render(app());
    expect(menuItem(/Organic Growth/).textContent).toContain("3 nye");
    expect(menuItem(/GEOtracking/).textContent).toContain("2 nye");
    expect(menuItem(/SimpleSERP/).textContent).toContain("1 ny");
  });

  it("lowers the counts as soon as a ticket is opened (US1-5, SC-007)", async () => {
    render(app());
    await userEvent.click(row("Kortet vises ikke"));
    expect(menuItem(/Organic Growth/).textContent).toContain("2 nye");
    expect(menuItem(/GEOtracking/).textContent).toContain("1 ny");
  });

  it("hides a platform's count when its last unread ticket is opened (FR-005)", async () => {
    render(app());
    await userEvent.click(row("Søgning er langsom"));
    expect(menuItem(/SimpleSERP/).textContent).toBe("SimpleSERP");
    expect(menuItem(/Organic Growth/).textContent).toContain("2 nye");
  });

  it("keeps ticket changes but resets the inbox view when the inbox remounts (US1-6, US1-7)", async () => {
    const { rerender } = render(app("first"));

    await userEvent.click(row("Eksport fejler"));
    await userEvent.click(screen.getByRole("button", { name: "Færdig/send" }));
    await userEvent.click(screen.getByRole("button", { name: /^Færdig \d/ }));
    expect(screen.getByRole("button", { name: /^Færdig \d/ }).getAttribute("aria-pressed")).toBe("true");

    // Same provider, new inbox: like going to another page and back.
    rerender(app("second"));

    expect(screen.getByRole("button", { name: /^Alle \d/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Vælg en feedback i listen for at se detaljerne.")).toBeTruthy();
    expect(within(row("Eksport fejler")).getByText("Færdig")).toBeTruthy();
    expect(menuItem(/GEOtracking/).textContent).toContain("1 ny");

    await userEvent.click(row("Eksport fejler"));
    expect(screen.getByRole("heading", { name: /^Sendt svar · / })).toBeTruthy();
  });
});
