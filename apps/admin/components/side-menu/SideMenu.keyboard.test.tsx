import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { AdminUser, Workspace } from "@/lib/types";
import { SideMenu } from "./SideMenu";

// FR-014 / SC-006: every menu item and the log-out link is reachable with Tab, in visual order.
// Native links handle Enter themselves.

const workspace: Workspace = {
  _id: "ws",
  name: "Organic Growth",
  platforms: ["geotracking", "simpleserp"],
};
const user: AdminUser = { _id: "u", name: "Hussein", role: "Admin", workspaceId: "ws" };

describe("SideMenu – keyboard only", () => {
  it("reaches every item and the log-out link with Tab, in order", async () => {
    render(
      <SideMenu
        workspace={workspace}
        user={user}
        activeHref="/"
      />,
    );

    const expected: [string | RegExp, string][] = [
      [/Feedback · Admin/, "/"],
      [/Organic Growth/, "/"],
      [/GEOtracking/, "/platforms/geotracking"],
      [/SimpleSERP/, "/platforms/simpleserp"],
      ["Indstillinger", "/settings"],
      ["Log ud", "/logged-out"],
    ];

    for (const [name, href] of expected) {
      await userEvent.tab();
      const focused = document.activeElement as HTMLElement;
      expect(focused).toBe(screen.getByRole("link", { name }));
      expect(focused.tagName).toBe("A");
      expect(focused.getAttribute("href")).toBe(href);
    }
  });
});
