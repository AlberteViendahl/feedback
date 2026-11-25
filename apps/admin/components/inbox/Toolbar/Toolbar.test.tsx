import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { mockCategories } from "@/lib/mock-categories";
import { Toolbar } from "./Toolbar";

function renderToolbar(overrides: Partial<Parameters<typeof Toolbar>[0]> = {}) {
  const props = {
    statusFilter: "all" as const,
    categoryFilter: "all" as const,
    sortOrder: "newest" as const,
    counts: { all: 65, done: 48 },
    categories: mockCategories,
    onStatusFilterChange: vi.fn(),
    onCategoryFilterChange: vi.fn(),
    onSortOrderChange: vi.fn(),
    ...overrides,
  };
  render(<Toolbar {...props} />);
  return props;
}

describe("Toolbar", () => {
  it("shows the counts and which status is active", () => {
    renderToolbar();
    expect(screen.getByRole("button", { name: "Alle 65" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Færdig 48" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("reports status changes", async () => {
    const props = renderToolbar();
    await userEvent.click(screen.getByRole("button", { name: "Færdig 48" }));
    expect(props.onStatusFilterChange).toHaveBeenCalledWith("done");
  });

  it("offers the Danish categories and reports a change", async () => {
    const props = renderToolbar();
    const select = screen.getByRole("combobox", { name: /Kategori/ });
    expect(
      Array.from((select as HTMLSelectElement).options).map((option) => option.textContent),
    ).toEqual(["Alle", "Fejl", "Forslag", "Generel feedback"]);

    await userEvent.selectOptions(select, "Forslag");
    expect(props.onCategoryFilterChange).toHaveBeenCalledWith("idea");
  });

  it("toggles the sort order", async () => {
    const props = renderToolbar();
    await userEvent.click(screen.getByRole("button", { name: "Nyeste først" }));
    expect(props.onSortOrderChange).toHaveBeenCalledWith("oldest");
  });

  it("labels the oldest-first state", () => {
    renderToolbar({ sortOrder: "oldest" });
    expect(screen.getByRole("button", { name: "Ældste først" })).toBeTruthy();
  });
});
