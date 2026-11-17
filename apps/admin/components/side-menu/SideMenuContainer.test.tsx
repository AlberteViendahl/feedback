import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TicketsProvider } from "@/components/TicketsProvider/TicketsProvider";
import { fixtureTickets } from "@/lib/inbox/test-fixtures";
import type { AdminUser, Workspace } from "@/lib/types";
import { SideMenuContainer } from "./SideMenuContainer";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const workspace: Workspace = {
  _id: "ws",
  name: "Organic Growth",
  platforms: ["geotracking", "simpleserp"],
};
const user: AdminUser = { _id: "u", name: "Hussein", role: "Admin", workspaceId: "ws" };

function renderAt(pathname: string, activeHref?: string | null) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  render(
    <TicketsProvider initialTickets={fixtureTickets}>
      <SideMenuContainer workspace={workspace} user={user} activeHref={activeHref} />
    </TicketsProvider>,
  );
}

function currentItem() {
  return screen.queryByRole("link", { current: "page" });
}

describe("SideMenuContainer", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReset();
  });

  it.each([
    ["/", /Organic Growth/],
    ["/platforms/geotracking", /GEOtracking/],
    ["/settings", /Indstillinger/],
  ])("highlights the item for %s", (pathname, name) => {
    renderAt(pathname);
    expect(currentItem()?.textContent).toMatch(name);
  });

  it("highlights nothing on an unknown platform", () => {
    renderAt("/platforms/foo");
    expect(currentItem()).toBeNull();
  });

  it("does not read the URL when activeHref is given (Suspense fallback)", () => {
    renderAt("/settings", null);
    expect(usePathname).not.toHaveBeenCalled();
    expect(currentItem()).toBeNull();
  });

  it("shows counts from the shared tickets", () => {
    renderAt("/");
    // fixtureTickets has one unread ticket, from GEOtracking.
    expect(screen.getByRole("link", { name: /Organic Growth/ }).textContent).toContain("1 ny");
  });
});
