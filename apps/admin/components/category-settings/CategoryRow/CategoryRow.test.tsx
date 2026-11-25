import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Category } from "@/lib/types";
import { CategoryRow } from "./CategoryRow";

const category: Category = {
  _id: "c1",
  _creationTime: 0,
  workspaceId: "ws",
  name: "Forbedring",
  icon: "inbox",
  color: "blue",
  isEnabled: true,
};

function renderRow(overrides: Partial<Category> = {}) {
  const onToggle = vi.fn();
  render(
    <ul>
      <CategoryRow category={{ ...category, ...overrides }} onToggle={onToggle} />
    </ul>,
  );
  return { onToggle, item: screen.getByRole("listitem") };
}

describe("CategoryRow", () => {
  it("shows the name next to the icon in the category's colour", () => {
    const { item } = renderRow();
    expect(item.textContent).toContain("Forbedring");
    expect(item.querySelector(".category-badge")?.className).toBe("category-badge category-badge--blue");
  });

  it("shows markup in a name as literal text (FR-013)", () => {
    const { item } = renderRow({ name: "<b>Forbedring</b>" });
    expect(item.textContent).toContain("<b>Forbedring</b>");
    expect(item.querySelector("b")).toBeNull();
  });

  it.each([
    [true, "true"],
    [false, "false"],
  ])("has a switch named after the category, checked = %s", (isEnabled, checked) => {
    renderRow({ isEnabled });
    expect(screen.getByRole("switch", { name: "Forbedring" }).getAttribute("aria-checked")).toBe(checked);
  });

  it("reports a click on the switch", async () => {
    const { onToggle } = renderRow();
    await userEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith("c1");
  });

  it("reports Space on the switch", async () => {
    const { onToggle } = renderRow();
    screen.getByRole("switch").focus();
    await userEvent.keyboard(" ");
    expect(onToggle).toHaveBeenCalledWith("c1");
  });
});
