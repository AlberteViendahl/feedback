import type { AdminUser, Workspace } from "@/lib/types";

// Mock data until the Convex backend exists. Only app/(admin)/layout.tsx may import this
// (Constitution V).

export const mockWorkspace: Workspace = {
  _id: "ws_organic_growth",
  name: "Organic Growth",
  platforms: ["geotracking", "simpleserp"],
};

export const mockUser: AdminUser = {
  _id: "user_hussein",
  name: "Hussein",
  role: "Admin",
  workspaceId: "ws_organic_growth",
};
