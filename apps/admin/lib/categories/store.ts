import { create } from "zustand";
import { mockCategories } from "@/lib/mock-categories";
import type { Category, CategoryColor, CategoryIcon } from "@/lib/types";
import { categoriesReducer, type CategoryAction } from "./state";

type CategoriesState = { categories: Category[] };

/**
 * The workspace's categories for this session, shared by the settings page and the inbox
 * (spec 006). Client-only, like the ticket store: nothing writes to it while rendering, and only
 * `state.categories` is selected. Replace with Convex queries later.
 */
export const useCategoriesStore = create<CategoriesState>()(() => ({ categories: mockCategories }));

function apply(action: CategoryAction) {
  useCategoriesStore.setState((state) => ({
    categories: categoriesReducer(state.categories, action),
  }));
}

/** Adds a category, switched on. Call from event handlers only: it reads an id and the clock. */
export function addCategory(input: { name: string; icon: CategoryIcon; color: CategoryColor }) {
  const { categories } = useCategoriesStore.getState();
  apply({
    type: "add",
    category: {
      ...input,
      _id: crypto.randomUUID(),
      _creationTime: Date.now(),
      workspaceId: categories[0]?.workspaceId ?? "ws_organic_growth",
      isEnabled: true,
    },
  });
}

export function toggleCategory(id: string) {
  apply({ type: "toggle", id });
}

/** Back to the categories as at first load: on log-out (FR-014) and after every test. */
export function resetCategories() {
  useCategoriesStore.setState(useCategoriesStore.getInitialState(), true);
}
