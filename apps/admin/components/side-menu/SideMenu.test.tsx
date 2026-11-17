import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NewCounts } from "@/lib/tickets/counts";
import type { AdminUser, Workspace } from "@/lib/types";
import { SideMenu } from "./SideMenu";

const workspace: Workspace = {
  _id: "ws",
  name: "Organic Growth",
  platforms: ["geotracking", "simpleserp"],
};
const user: AdminUser = { _id: "u", name: "Hussein", role: "Admin", workspaceId: "ws" };
const counts: NewCounts = { total: 4, byPlatform: { geotracking: 3, simpleserp: 1 } };

function renderMenu(activeHref: string | null = "/") {
  render(<SideMenu workspace={workspace} user={user} counts={counts} activeHref={activeHref} />);
  return screen.getByRole("navigation", { name: "Hovedmenu" });
}

function link(name: string | RegExp) {
  return screen.getByRole("link", { name });
}

describe("SideMenu", () => {
  it("shows the brand, workspace and platforms with their counts", () => {
    renderMenu();
    expect(link(/Feedback · Admin/).getAttribute("href")).toBe("/");
    expect(link(/Organic Growth/).getAttribute("href")).toBe("/");
    expect(within(link(/Organic Growth/)).getByText("4 nye")).toBeTruthy();
    expect(screen.getByText("Platforme")).toBeTruthy();
    expect(link(/GEOtracking/).getAttribute("href")).toBe("/platforms/geotracking");
    expect(within(link(/GEOtracking/)).getByText("3 nye")).toBeTruthy();
    expect(link(/SimpleSERP/).getAttribute("href")).toBe("/platforms/simpleserp");
    expect(within(link(/SimpleSERP/)).getByText("1 ny")).toBeTruthy();
  });

  it("lists platforms in the workspace's order", () => {
    const nav = renderMenu();
    const labels = within(nav)
      .getAllByRole("link")
      .map((item) => item.textContent);
    expect(labels.findIndex((text) => text?.startsWith("GEOtracking"))).toBeLessThan(
      labels.findIndex((text) => text?.startsWith("SimpleSERP")),
    );
  });

  it("has a settings item near the bottom without a count", () => {
    const nav = renderMenu();
    const items = within(nav).getAllByRole("link");
    expect(items.at(-2)).toBe(link("Indstillinger"));
    expect(link("Indstillinger").getAttribute("href")).toBe("/settings");
  });

  it("ends with the user block and the log-out link", () => {
    const nav = renderMenu();
    expect(within(nav).getByText("Hussein")).toBeTruthy();
    expect(within(nav).getByText("Admin · Organic Growth")).toBeTruthy();
    expect(within(nav).getAllByRole("link").at(-1)).toBe(link("Log ud"));
  });

  it.each([
    ["/", /Organic Growth/],
    ["/platforms/simpleserp", /SimpleSERP/],
    ["/settings", "Indstillinger"],
  ])("highlights only the item for %s", (activeHref, name) => {
    const nav = renderMenu(activeHref);
    const current = within(nav).getAllByRole("link").filter((item) => item.getAttribute("aria-current") === "page");
    expect(current).toEqual([link(name)]);
  });

  it("highlights nothing when no item matches", () => {
    const nav = renderMenu(null);
    expect(nav.querySelector('[aria-current="page"]')).toBeNull();
  });
});
