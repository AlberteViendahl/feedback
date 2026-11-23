import { render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeTicket } from "@/lib/inbox/test-fixtures";
import { useTicketsStore } from "@/lib/tickets/store";
import type { AdminUser, Feedback, Platform, Workspace } from "@/lib/types";
import { SideMenu } from "./SideMenu";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const workspace: Workspace = {
  _id: "ws",
  name: "Organic Growth",
  platforms: ["geotracking", "simpleserp"],
};
const user: AdminUser = { _id: "u", name: "Hussein", role: "Admin", workspaceId: "ws" };

function unread(id: string, platform: Platform): Feedback {
  const base = makeTicket({ _id: id });
  return { ...base, context: { ...base.context, platform } };
}

// Four unread tickets: three from GEOtracking, one from SimpleSERP.
const tickets = [
  unread("a", "geotracking"),
  unread("b", "geotracking"),
  unread("c", "geotracking"),
  unread("d", "simpleserp"),
];

beforeEach(() => {
  vi.mocked(usePathname).mockReset();
  useTicketsStore.setState({ tickets });
});

function renderMenu(activeHref: string | null = "/") {
  render(<SideMenu workspace={workspace} user={user} activeHref={activeHref} />);
  return screen.getByRole("navigation", { name: "Hovedmenu" });
}

/** No activeHref, so the menu reads the (mocked) URL itself. */
function renderAtUrl(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  render(<SideMenu workspace={workspace} user={user} />);
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

  it.each([
    ["/", /Organic Growth/],
    ["/platforms/geotracking", /GEOtracking/],
    ["/settings", /Indstillinger/],
  ])("reads the URL and highlights the item for %s", (pathname, name) => {
    renderAtUrl(pathname);
    expect(screen.queryByRole("link", { current: "page" })?.textContent).toMatch(name);
  });

  it("highlights nothing on an unknown platform URL", () => {
    renderAtUrl("/platforms/foo");
    expect(screen.queryByRole("link", { current: "page" })).toBeNull();
  });

  it("does not read the URL when activeHref is given (Suspense fallback)", () => {
    renderMenu(null);
    expect(usePathname).not.toHaveBeenCalled();
  });
});
