import { describe, expect, it } from "vitest";
import { mockCategories } from "@/lib/mock-categories";
import { addCategory, resetCategories, toggleCategory, useCategoriesStore } from "./store";

function categories() {
  return useCategoriesStore.getState().categories;
}

describe("category store", () => {
  it("starts with the mock data", () => {
    expect(categories()).toBe(mockCategories);
  });

  it("addCategory adds a switched-on category last, with a fresh id", () => {
    addCategory({ name: "Forbedring", icon: "inbox", color: "blue" });
    const added = categories().at(-1);
    expect(added).toMatchObject({ name: "Forbedring", icon: "inbox", color: "blue", isEnabled: true });
    expect(mockCategories.map((category) => category._id)).not.toContain(added?._id);
  });

  it("toggleCategory switches one category off", () => {
    toggleCategory("general");
    expect(categories().find((category) => category._id === "general")?.isEnabled).toBe(false);
  });

  it("resetCategories brings back the mock data", () => {
    addCategory({ name: "Forbedring", icon: "inbox", color: "blue" });
    toggleCategory("bug");
    resetCategories();
    expect(categories()).toBe(mockCategories);
  });
});
