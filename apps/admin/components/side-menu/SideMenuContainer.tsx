"use client";

import { usePathname } from "next/navigation";
import { getActiveHref, getMenuHrefs } from "@/lib/side-menu/active-href";
import { getNewCounts } from "@/lib/tickets/counts";
import { useTicketsStore } from "@/lib/tickets/store";
import type { AdminUser, Workspace } from "@/lib/types";
import { SideMenu } from "./SideMenu";

type SideMenuContainerProps = {
  workspace: Workspace;
  user: AdminUser;
  /** Pass null to skip reading the URL (the layout's Suspense fallback). Omit to use the URL. */
  activeHref?: string | null;
};

/** Connects the menu to the shared tickets (live counts) and the current URL (highlight). */
export function SideMenuContainer({ activeHref, ...props }: SideMenuContainerProps) {
  if (activeHref !== undefined) return <MenuWithCounts {...props} activeHref={activeHref} />;
  return <MenuWithPathname {...props} />;
}

type MenuProps = Omit<SideMenuContainerProps, "activeHref">;

// usePathname suspends on unknown dynamic params under Cache Components, so it lives in its
// own component that the layout wraps in <Suspense> (research R5).
function MenuWithPathname(props: MenuProps) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname, getMenuHrefs(props.workspace.platforms));
  return <MenuWithCounts {...props} activeHref={activeHref} />;
}

function MenuWithCounts({ workspace, user, activeHref }: MenuProps & { activeHref: string | null }) {
  const tickets = useTicketsStore((state) => state.tickets);
  return (
    <SideMenu
      workspace={workspace}
      user={user}
      counts={getNewCounts(tickets)}
      activeHref={activeHref}
    />
  );
}
