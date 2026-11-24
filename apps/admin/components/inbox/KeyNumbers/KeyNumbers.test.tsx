import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { KeyNumbers as KeyNumbersData } from "@/lib/tickets/key-numbers";
import { KeyNumbers } from "./KeyNumbers";

const numbers: KeyNumbersData = {
  newCount: 12,
  inProgressCount: 5,
  doneLast30Days: 48,
  bugsThisWeek: 7,
  bugsChange: null,
};

function renderCards(overrides: Partial<KeyNumbersData> = {}) {
  render(<KeyNumbers numbers={{ ...numbers, ...overrides }} />);
  return within(screen.getByRole("list", { name: "Nøgletal" })).getAllByRole("listitem");
}

describe("KeyNumbers (US1)", () => {
  it("shows the four cards in order, number before label", () => {
    expect(renderCards().map((card) => card.textContent)).toEqual([
      "12Nye · ikke åbnet endnu",
      "5I gang",
      "48Færdige · sidste 30 dage",
      "7Fejl denne uge",
    ]);
  });

  it("colours the cards new, in progress, done, bugs", () => {
    const cards = renderCards();
    expect(cards.map((card) => card.className)).toEqual([
      "stat-card stat-card--info",
      "stat-card stat-card--warning",
      "stat-card stat-card--success",
      "stat-card stat-card--danger",
    ]);
  });

  it("shows a dash while a number is unknown", () => {
    const cards = renderCards({ doneLast30Days: null, bugsThisWeek: null });
    expect(cards[2].textContent).toBe("–Færdige · sidste 30 dage");
    expect(cards[3].textContent).toBe("–Fejl denne uge");
  });

  it("formats large numbers the Danish way", () => {
    expect(renderCards({ newCount: 1234 })[0].textContent).toBe("1.234Nye · ikke åbnet endnu");
  });
});

describe("KeyNumbers – change in bugs (US3)", () => {
  it("shows more bugs than last week as an up arrow", () => {
    const bugs = renderCards({ bugsChange: 3 })[3];
    expect(within(bugs).getByText("↑ 3").getAttribute("aria-hidden")).toBe("true");
    expect(within(bugs).getByText("3 flere end sidste uge").className).toBe("sr-only");
  });

  it("shows fewer bugs than last week as a down arrow", () => {
    const bugs = renderCards({ bugsChange: -3 })[3];
    expect(within(bugs).getByText("↓ 3")).toBeTruthy();
    expect(within(bugs).getByText("3 færre end sidste uge")).toBeTruthy();
  });

  it.each([0, null])("shows no change for %s", (bugsChange) => {
    expect(renderCards({ bugsChange })[3].textContent).toBe("7Fejl denne uge");
  });
});

describe("KeyNumbers – information only (US4)", () => {
  it("has nothing to click or focus", () => {
    renderCards();
    const row = screen.getByRole("list", { name: "Nøgletal" });
    expect(row.querySelectorAll("button, a, input, select, textarea, [tabindex]")).toHaveLength(0);
  });

  it("reads each card as its number followed by its label", () => {
    const cards = renderCards({ bugsChange: 3 });
    expect(cards[0].textContent).toBe("12Nye · ikke åbnet endnu");
    // The arrow is hidden from screen readers; the hidden text says the same in words.
    expect(cards[3].querySelector("[aria-hidden='true']:not(svg)")?.textContent).toBe("↑ 3");
  });

  it("keeps the icons decorative", () => {
    renderCards();
    const icons = screen.getByRole("list", { name: "Nøgletal" }).querySelectorAll("svg");
    expect(icons).toHaveLength(4);
    icons.forEach((icon) => expect(icon.getAttribute("aria-hidden")).toBe("true"));
  });
});
