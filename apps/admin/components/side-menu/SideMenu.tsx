"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icons/Icon";
import { PLATFORM_LABELS } from "@/lib/platforms";
import { SETTINGS_HREF, getActiveHref, getMenuHrefs, platformHref } from "@/lib/side-menu/active-href";
import { getNewCounts } from "@/lib/tickets/counts";
import { useTicketsStore } from "@/lib/tickets/store";
import type { AdminUser, Platform, Workspace } from "@/lib/types";
import { NavItem } from "./NavItem/NavItem";
import { UserBlock } from "./UserBlock/UserBlock";

type SideMenuProps = {
  workspace: Workspace;
  user: AdminUser;
  /** Pass null to skip reading the URL (the layout's Suspense fallback). Omit to use the URL. */
  activeHref?: string | null;
};

const PLATFORM_ICONS: Record<Platform, { circle: IconName; glyph: IconName }> = {
  geotracking: { circle: "platform-geotracking", glyph: "nav-globe" },
  simpleserp: { circle: "platform-simpleserp", glyph: "nav-search" },
};

function PlatformIcon({ platform }: { platform: Platform }) {
  const { circle, glyph } = PLATFORM_ICONS[platform];
  return (
    <span className="icon-stack" aria-hidden="true">
      <Icon name={circle} />
      <Icon name={glyph} />
    </span>
  );
}

/** The main menu, with live counts from the ticket store and the current page highlighted. */
export function SideMenu({ workspace, user, activeHref }: SideMenuProps) {
  // Hooks must run before the early return below (React's rules of hooks).
  const tickets = useTicketsStore((state) => state.tickets);
  if (activeHref === undefined) return <SideMenuAtCurrentUrl workspace={workspace} user={user} />;
  const counts = getNewCounts(tickets);

  return (
    <nav aria-label="Hovedmenu" className="side-menu">
      <Link href="/" className="brand-pill side-menu__brand">
        <strong>Feedback</strong> · Admin
      </Link>

      <div className="side-menu__scroll">
        <NavItem
          href="/"
          label={workspace.name}
          icon={<Icon name="workspace-avatar" className="shrink-0" />}
          count={counts.total}
          isActive={activeHref === "/"}
        />

        <p className="text-overline side-menu__section-label">Platforme</p>
        <div className="side-menu__platforms">
          {workspace.platforms.map((platform) => (
            <NavItem
              key={platform}
              href={platformHref(platform)}
              label={PLATFORM_LABELS[platform]}
              icon={<PlatformIcon platform={platform} />}
              count={counts.byPlatform[platform]}
              isActive={activeHref === platformHref(platform)}
            />
          ))}
        </div>
      </div>

      <div className="side-menu__footer">
        <NavItem
          href={SETTINGS_HREF}
          label="Indstillinger"
          icon={<Icon name="settings" className="shrink-0" />}
          isActive={activeHref === SETTINGS_HREF}
        />
        <div className="divider" />
        <UserBlock user={user} workspaceName={workspace.name} />
      </div>
    </nav>
  );
}

// usePathname suspends on unknown dynamic params under Cache Components, so it lives in its
// own component that the layout wraps in <Suspense> (spec 002, research R5).
function SideMenuAtCurrentUrl({ workspace, user }: Omit<SideMenuProps, "activeHref">) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname, getMenuHrefs(workspace.platforms));
  return <SideMenu workspace={workspace} user={user} activeHref={activeHref} />;
}
