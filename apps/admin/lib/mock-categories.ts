import type { Category } from "@/lib/types";

// Mock data until the Convex backend exists. Only lib/categories/store.ts imports this.

export const mockCategories: Category[] = [
  {
    _id: "bug",
    _creationTime: Date.UTC(2026, 9, 1, 9, 0),
    workspaceId: "ws_organic_growth",
    name: "Fejl",
    icon: "bug",
    color: "red",
    isEnabled: true,
  },
  {
    _id: "idea",
    _creationTime: Date.UTC(2026, 9, 1, 9, 1),
    workspaceId: "ws_organic_growth",
    name: "Forslag",
    icon: "lightbulb",
    color: "yellow",
    isEnabled: true,
  },
  {
    _id: "general",
    _creationTime: Date.UTC(2026, 9, 1, 9, 2),
    workspaceId: "ws_organic_growth",
    name: "Generel feedback",
    icon: "message",
    color: "teal",
    isEnabled: true,
  },
];
