import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavItem } from "./NavItem";

function renderItem(props: Partial<Parameters<typeof NavItem>[0]> = {}) {
  render(
    <NavItem
      href="/platforms/geotracking"
      label="GEOtracking"
      icon={<span data-testid="icon" />}
      isActive={false}
      {...props}
    />,
  );
  return screen.getByRole("link");
}

describe("NavItem", () => {
  it("links to its page with icon and label", () => {
    const link = renderItem();
    expect(link.getAttribute("href")).toBe("/platforms/geotracking");
    expect(link.textContent).toContain("GEOtracking");
    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it.each([
    [3, "3 nye"],
    [1, "1 ny"],
  ])("shows a count of %d as %s", (count, text) => {
    renderItem({ count });
    expect(screen.getByText(text)).toBeTruthy();
  });

  it.each([0, undefined])("hides the count when it is %s", (count) => {
    const link = renderItem({ count });
    expect(link.textContent).toBe("GEOtracking");
  });

  it("marks the active item", () => {
    const link = renderItem({ isActive: true });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).toContain("nav-item--active");
  });

  it("leaves inactive items unmarked", () => {
    const link = renderItem();
    expect(link.getAttribute("aria-current")).toBeNull();
    expect(link.className).not.toContain("nav-item--active");
  });
});
