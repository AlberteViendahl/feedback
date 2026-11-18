import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

const user = { _id: "u", name: "Hussein", role: "Admin", workspaceId: "ws" };

// jsdom applies no CSS, so these tests cover state, focus and inert. The drawer's
// slide-in and the breakpoint are checked in the browser.
function renderShell() {
  const { container } = render(
    <AppShell
      user={user}
      menu={
        <nav aria-label="Hovedmenu">
          <a href="#indstillinger">Indstillinger</a>
        </nav>
      }
    >
      <p>Indhold</p>
    </AppShell>,
  );
  return {
    shell: container.firstElementChild as HTMLElement,
    main: screen.getByText("Indhold").closest("main") as HTMLElement,
    backdrop: container.querySelector(".app-shell__backdrop") as HTMLElement,
    openButton: () => screen.getByRole("button", { name: "Åbn menu" }),
    closeButton: () => screen.getByRole("button", { name: "Luk menu" }),
  };
}

async function openMenu(shell: ReturnType<typeof renderShell>) {
  await userEvent.click(shell.openButton());
  expect(shell.shell.classList.contains("app-shell--menu-open")).toBe(true);
}

function isOpen(shell: ReturnType<typeof renderShell>) {
  return shell.shell.classList.contains("app-shell--menu-open");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AppShell", () => {
  it("starts with the menu closed and the menu button pointing at the menu", () => {
    const shell = renderShell();
    const menu = screen.getByRole("navigation", { name: "Hovedmenu" }).closest("aside");

    expect(isOpen(shell)).toBe(false);
    expect(shell.openButton().getAttribute("aria-expanded")).toBe("false");
    expect(shell.openButton().getAttribute("aria-controls")).toBe(menu?.id);
    expect(shell.main.hasAttribute("inert")).toBe(false);
  });

  it("opens the menu, moves focus into it and makes the page inert", async () => {
    const shell = renderShell();
    await openMenu(shell);

    expect(shell.openButton().getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(shell.closeButton());
    expect(shell.main.hasAttribute("inert")).toBe(true);
    expect(shell.openButton().closest("header")?.hasAttribute("inert")).toBe(true);
  });

  it("closes with Luk menu and returns focus to the menu button", async () => {
    const shell = renderShell();
    await openMenu(shell);
    await userEvent.click(shell.closeButton());

    expect(isOpen(shell)).toBe(false);
    expect(document.activeElement).toBe(shell.openButton());
    expect(shell.main.hasAttribute("inert")).toBe(false);
  });

  it("closes with Escape", async () => {
    const shell = renderShell();
    await openMenu(shell);
    await userEvent.keyboard("{Escape}");

    expect(isOpen(shell)).toBe(false);
    expect(document.activeElement).toBe(shell.openButton());
  });

  it("closes when the backdrop is clicked", async () => {
    const shell = renderShell();
    await openMenu(shell);
    await userEvent.click(shell.backdrop);

    expect(isOpen(shell)).toBe(false);
  });

  it("closes when a link in the menu is followed", async () => {
    const shell = renderShell();
    await openMenu(shell);
    await userEvent.click(screen.getByRole("link", { name: "Indstillinger" }));

    expect(isOpen(shell)).toBe(false);
  });

  it("stays open on resize while the drawer is in use", async () => {
    const shell = renderShell();
    await openMenu(shell);
    act(() => {
      fireEvent(window, new Event("resize"));
    });

    expect(isOpen(shell)).toBe(true);
  });

  it("closes when the window grows past the breakpoint (the backdrop is hidden)", async () => {
    const shell = renderShell();
    await openMenu(shell);

    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) =>
      element === shell.backdrop
        ? ({ display: "none" } as CSSStyleDeclaration)
        : getComputedStyle(element, pseudo),
    );
    act(() => {
      fireEvent(window, new Event("resize"));
    });

    expect(isOpen(shell)).toBe(false);
  });
});
