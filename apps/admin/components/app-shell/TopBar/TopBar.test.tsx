import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

function renderTopBar(isMenuOpen = false) {
  const onOpenMenu = vi.fn();
  render(
    <TopBar userName="hussein" menuId="menu" isMenuOpen={isMenuOpen} onOpenMenu={onOpenMenu} />,
  );
  return { onOpenMenu };
}

describe("TopBar", () => {
  it("shows the product name and the user's initial", () => {
    renderTopBar();
    expect(screen.getByText("Feedback").closest("p")?.textContent).toBe("Feedback · Admin");
    expect(screen.getByText("H")).toBeTruthy();
  });

  it("has a menu button that controls the side menu", () => {
    renderTopBar();
    const button = screen.getByRole("button", { name: "Åbn menu" });
    expect(button.getAttribute("aria-controls")).toBe("menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("reports a click on the menu button", async () => {
    const { onOpenMenu } = renderTopBar();
    await userEvent.click(screen.getByRole("button", { name: "Åbn menu" }));
    expect(onOpenMenu).toHaveBeenCalledOnce();
  });

  it("marks the menu as expanded and goes inert while the menu is open", () => {
    renderTopBar(true);
    const button = screen.getByRole("button", { name: "Åbn menu" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.closest("header")?.hasAttribute("inert")).toBe(true);
  });
});
