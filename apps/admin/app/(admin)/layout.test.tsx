import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminLayout from "./layout";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// jsdom does not lay out pages, so this checks the structure behind the sticky full-height
// menu (US1-1, FR-001). The stickiness itself is checked by hand in quickstart.md.
describe("AdminLayout", () => {
  it("puts the menu in the sticky aside and the page in main, side by side", () => {
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>Indhold</p>
      </AdminLayout>,
    );

    const menu = screen.getByRole("navigation", { name: "Hovedmenu" });
    const aside = menu.closest("aside");
    const main = screen.getByText("Indhold").closest("main");

    expect(aside?.className).toContain("app-shell__menu");
    expect(main?.className).toContain("app-shell__content");
    expect(aside?.parentElement).toBe(main?.parentElement);
    expect(aside?.parentElement?.className).toContain("app-shell");
  });

  it("shows the mock workspace's counts", () => {
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>Indhold</p>
      </AdminLayout>,
    );
    expect(screen.getByRole("link", { name: /Organic Growth/ }).textContent).toContain("4 nye");
  });

  it("gives tablet and mobile a menu button that opens the side menu", () => {
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>Indhold</p>
      </AdminLayout>,
    );

    const aside = screen.getByRole("navigation", { name: "Hovedmenu" }).closest("aside");
    const button = screen.getByRole("button", { name: "Åbn menu" });
    expect(button.getAttribute("aria-controls")).toBe(aside?.id);
  });
});
