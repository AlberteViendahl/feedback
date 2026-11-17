import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryIcon } from "./CategoryIcon";

describe("CategoryIcon", () => {
  it.each([
    ["bug", "Fejl", "/icons/category-bug.svg"],
    ["idea", "Forslag", "/icons/category-idea.svg"],
    ["general", "Generel feedback", "/icons/category-general.svg"],
  ] as const)("shows the %s icon with Danish alt text", (category, label, src) => {
    render(<CategoryIcon category={category} />);
    expect(screen.getByAltText(label).getAttribute("src")).toBe(src);
  });
});
