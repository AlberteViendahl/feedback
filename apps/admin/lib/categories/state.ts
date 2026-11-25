import type { Category } from "@/lib/types";

/** Changes to the workspace's categories (spec 006, data-model.md). */
export type CategoryAction =
  | { type: "add"; category: Category }
  | { type: "toggle"; id: string };

function normalize(name: string) {
  return name.trim().toLocaleLowerCase("da");
}

/** Why a name cannot be used for a new category, or null if it can (FR-008, FR-010). */
export function validateCategoryName(
  name: string,
  categories: Category[],
): "empty" | "duplicate" | null {
  const key = normalize(name);
  if (key === "") return "empty";
  if (categories.some((category) => normalize(category.name) === key)) return "duplicate";
  return null;
}

/** Disallowed actions return the same array, so React skips re-rendering. */
export function categoriesReducer(categories: Category[], action: CategoryAction): Category[] {
  switch (action.type) {
    case "add": {
      if (validateCategoryName(action.category.name, categories) !== null) return categories;
      return [...categories, { ...action.category, name: action.category.name.trim() }];
    }
    case "toggle": {
      if (!categories.some((category) => category._id === action.id)) return categories;
      return categories.map((category) =>
        category._id === action.id ? { ...category, isEnabled: !category.isEnabled } : category,
      );
    }
  }
}

export function getCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((category) => category._id === id);
}
