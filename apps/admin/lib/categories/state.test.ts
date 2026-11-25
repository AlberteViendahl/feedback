import { describe, expect, it } from "vitest";
import type { Category } from "@/lib/types";
import { categoriesReducer, getCategory, validateCategoryName } from "./state";

function makeCategory(overrides: Partial<Category> & Pick<Category, "_id" | "name">): Category {
  return {
    _creationTime: 0,
    workspaceId: "ws",
    icon: "bug",
    color: "red",
    isEnabled: true,
    ...overrides,
  };
}

const categories = [
  makeCategory({ _id: "bug", name: "Fejl" }),
  makeCategory({ _id: "idea", name: "Forslag" }),
  makeCategory({ _id: "beer", name: "Øl" }),
];

describe("validateCategoryName", () => {
  it.each(["", "   "])("refuses a blank name (%j)", (name) => {
    expect(validateCategoryName(name, categories)).toBe("empty");
  });

  it.each(["fejl", " FEJL ", "Fejl", "ØL", "øl"])(
    "refuses %j because it matches an existing name ignoring case and spaces",
    (name) => {
      expect(validateCategoryName(name, categories)).toBe("duplicate");
    },
  );

  it("accepts a new name", () => {
    expect(validateCategoryName("  Forbedring ", categories)).toBeNull();
  });
});

describe("categoriesReducer", () => {
  it("adds a category last, with the name trimmed", () => {
    const next = categoriesReducer(categories, {
      type: "add",
      category: makeCategory({ _id: "new", name: "  Forbedring  " }),
    });
    expect(next.map((category) => category.name)).toEqual(["Fejl", "Forslag", "Øl", "Forbedring"]);
  });

  it.each(["   ", " fejl "])("ignores an add with an invalid name (%j)", (name) => {
    const next = categoriesReducer(categories, {
      type: "add",
      category: makeCategory({ _id: "new", name }),
    });
    expect(next).toBe(categories);
  });

  it("toggles only the given category", () => {
    const next = categoriesReducer(categories, { type: "toggle", id: "idea" });
    expect(next.map((category) => category.isEnabled)).toEqual([true, false, true]);
    expect(categoriesReducer(next, { type: "toggle", id: "idea" })[1].isEnabled).toBe(true);
  });

  it("returns the same array for an unknown id", () => {
    expect(categoriesReducer(categories, { type: "toggle", id: "nope" })).toBe(categories);
  });
});

describe("getCategory", () => {
  it("finds a category by id", () => {
    expect(getCategory(categories, "idea")?.name).toBe("Forslag");
  });

  it("returns undefined for an unknown id", () => {
    expect(getCategory(categories, "nope")).toBeUndefined();
  });
});
