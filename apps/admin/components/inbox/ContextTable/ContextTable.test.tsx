import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { at, makeTicket } from "@/lib/inbox/test-fixtures";
import { ContextTable } from "./ContextTable";

const ticket = makeTicket({ _id: "t", _creationTime: at("2026-10-28T11:42:00+01:00") });

function renderTable(pageUrl = ticket.context.pageUrl) {
  render(
    <ContextTable
      context={{ ...ticket.context, pageUrl }}
      sender={ticket.sender}
      sentAt={ticket._creationTime}
    />,
  );
}

function valueOf(label: string) {
  return screen.getByText(label).nextElementSibling as HTMLElement;
}

describe("ContextTable", () => {
  it("shows all six context values", () => {
    renderTable();
    expect(screen.getByRole("heading", { name: "Kontekst (sendt automatisk)" })).toBeTruthy();
    expect(valueOf("Platform").textContent).toBe("GEOtracking");
    expect(valueOf("Side").textContent).toBe("/overview");
    expect(valueOf("Bruger").textContent).toBe("anna@company.dk · ID 4821");
    expect(valueOf("Browser og OS").textContent).toBe("Chrome 130 · macOS");
    expect(valueOf("Skærmstørrelse").textContent).toBe("1440 × 900");
    expect(valueOf("Tidspunkt").textContent).toBe("28. okt. 2026, 11.42");
  });

  it("links a web address in a new tab", () => {
    renderTable();
    const link = within(valueOf("Side")).getByRole("link", { name: "/overview" });
    expect(link.getAttribute("href")).toBe("https://app.geotracking.dk/overview");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("shows a javascript: address as plain text, not a link", () => {
    renderTable("javascript:alert(1)");
    expect(within(valueOf("Side")).queryByRole("link")).toBeNull();
    expect(valueOf("Side").textContent).toBe("javascript:alert(1)");
  });
});
