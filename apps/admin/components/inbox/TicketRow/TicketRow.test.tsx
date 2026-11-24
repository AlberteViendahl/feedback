import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { at, makeTicket } from "@/lib/inbox/test-fixtures";
import { TicketRow } from "./TicketRow";

const now = at("2026-11-17T11:42:00+01:00");

const ticket = makeTicket({
  _id: "fb_1042",
  _creationTime: at("2026-11-17T11:40:00+01:00"),
  description: "When I click “Add website” nothing happens",
  attachments: [
    { kind: "image", fileName: "a.png", sizeBytes: 1000 },
    { kind: "video", fileName: "b.mp4", durationSeconds: 14 },
  ],
});

function renderRow(props: Partial<Parameters<typeof TicketRow>[0]> = {}) {
  const onSelect = vi.fn();
  render(<TicketRow ticket={ticket} isSelected={false} now={now} onSelect={onSelect} {...props} />);
  return { onSelect, row: screen.getByRole("button") };
}

describe("TicketRow", () => {
  it("shows icon, preview, sender, platform, page, time, attachments and badge", () => {
    const { row } = renderRow();
    const view = within(row);
    expect(view.getByRole("img", { name: "Fejl" })).toBeTruthy();
    expect(view.getByText("When I click “Add website” nothing happens")).toBeTruthy();
    expect(view.getByText("anna@company.dk · GEOtracking · /overview")).toBeTruthy();
    expect(view.getByText("2 min siden")).toBeTruthy();
    expect(view.getByRole("img", { name: "Vedhæftede filer" }).parentElement?.textContent).toBe("2");
    expect(view.getByText("Ny")).toBeTruthy();
  });

  it.each([
    ["bug", "Fejl"],
    ["idea", "Forslag"],
    ["general", "Generel feedback"],
  ] as const)("shows the %s icon named %s", (category, label) => {
    renderRow({ ticket: { ...ticket, category } });
    expect(screen.getByRole("img", { name: label }).parentElement?.className).toBe(
      `category-badge category-badge--${category}`,
    );
  });

  it("shows the date while the current time is unknown", () => {
    renderRow({ now: null });
    expect(screen.getByText("17. nov. 2026")).toBeTruthy();
  });

  it("has no attachment indicator without attachments", () => {
    renderRow({ ticket: { ...ticket, attachments: [] } });
    expect(screen.queryByRole("img", { name: "Vedhæftede filer" })).toBeNull();
  });

  it("marks the selected row", () => {
    const { row } = renderRow({ isSelected: true });
    expect(row.getAttribute("aria-current")).toBe("true");
    expect(row.className).toContain("list-row--selected");
  });

  it("shows markup in the description as literal text", () => {
    const markup = "<img src=x onerror=alert(1)>";
    const { row } = renderRow({ ticket: { ...ticket, description: markup } });
    expect(within(row).getByText(markup)).toBeTruthy();
    expect(row.querySelector('img[src="x"]')).toBeNull();
  });

  it("reports clicks with the ticket id", async () => {
    const { onSelect, row } = renderRow();
    await userEvent.click(row);
    expect(onSelect).toHaveBeenCalledWith("fb_1042");
  });
});
